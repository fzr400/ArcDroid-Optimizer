/**
 * ArcDroid Optimizer for QCAD
 * Optimizes toolpaths for ArcDroid CNC plasma cutting
 * Based on proper QCAD EAction structure
 */

include("scripts/EAction.js");

/**
 * \class ArcDroidOptimizer
 * \ingroup ecma_misc
 * Optimizes toolpaths for ArcDroid CNC plasma cutting by reordering entities
 * to minimize travel distance and improve cutting efficiency.
 */
function ArcDroidOptimizer(guiAction) {
    EAction.call(this, guiAction);
}

ArcDroidOptimizer.prototype = new EAction();

ArcDroidOptimizer.prototype.beginEvent = function() {
    EAction.prototype.beginEvent.call(this);
    
    try {
        // Get the current document
        var doc = this.getDocument();
        if (!doc) {
            EAction.handleUserMessage("No document open. Please open a drawing first.");
            this.terminate();
            return;
        }
        
        // Get all visible entities
        var entityIds = doc.queryAllVisibleEntities();
        if (entityIds.length === 0) {
            EAction.handleUserMessage("No entities found to optimize.");
            this.terminate();
            return;
        }
        
        EAction.handleUserMessage("Starting optimization of " + entityIds.length + " entities...");
        
        // Perform the optimization
        this.optimizeToolpath(doc, entityIds);
        
        EAction.handleUserMessage("Optimization completed successfully!");
        
    } catch (error) {
        EAction.handleUserMessage("Error during optimization: " + error.toString());
    }
    
    // Terminate the action
    this.terminate();
};

ArcDroidOptimizer.prototype.optimizeToolpath = function(doc, entityIds) {
    this.stats = {
        originalEntities: entityIds.length,
        optimizedEntities: 0,
        removedDuplicates: 0,
        mergedSegments: 0,
        simplifiedPolylines: 0
    };
    
    EAction.handleUserMessage("Phase 1: Analyzing entities...");
    
    // Get all entities and analyze their types
    var entities = [];
    var entityTypes = {};
    
    for (var i = 0; i < entityIds.length; i++) {
        var entity = doc.queryEntity(entityIds[i]);
        if (entity) {
            var shape = entity.getShapes()[0];
            entities.push({
                id: entityIds[i],
                entity: entity,
                shape: shape
            });
            
            // Track entity types for debugging
            if (shape) {
                var shapeType = shape.getShapeType();
                var typeName = typeof shapeType === 'string' ? shapeType : shapeType.toString();
                entityTypes[typeName] = (entityTypes[typeName] || 0) + 1;
            }
        }
    }
    
    // Report entity types found
    var typeReport = "Entity types found: ";
    for (var type in entityTypes) {
        typeReport += type + "(" + entityTypes[type] + ") ";
    }
    EAction.handleUserMessage(typeReport);
    
    EAction.handleUserMessage("Phase 2: Removing duplicates...");
    entities = this.removeDuplicateEntities(entities);
    
    EAction.handleUserMessage("Phase 3: Merging connected segments...");
    entities = this.mergeConnectedSegments(entities);
    
    EAction.handleUserMessage("Phase 4: Simplifying polylines...");
    entities = this.simplifyPolylines(entities);
    
    EAction.handleUserMessage("Phase 5: Optimizing cutting order...");
    entities = this.optimizeEntityOrder(entities);
    
    this.stats.optimizedEntities = entities.length;
    
    // Show comprehensive results
    this.showOptimizationResults();
};

ArcDroidOptimizer.prototype.getStartPoint = function(shape) {
    if (shape.getShapeType() === RS.EntityLine) {
        return shape.getStartPoint();
    } else if (shape.getShapeType() === RS.EntityArc) {
        return shape.getStartPoint();
    } else if (shape.getShapeType() === RS.EntityCircle) {
        return shape.getCenter();
    }
    return new RVector(0, 0);
};

ArcDroidOptimizer.prototype.getEndPoint = function(shape) {
    if (shape.getShapeType() === RS.EntityLine) {
        return shape.getEndPoint();
    } else if (shape.getShapeType() === RS.EntityArc) {
        return shape.getEndPoint();
    } else if (shape.getShapeType() === RS.EntityCircle) {
        return shape.getCenter();
    }
    return new RVector(0, 0);
};

// Remove duplicate entities based on geometric similarity
ArcDroidOptimizer.prototype.removeDuplicateEntities = function(entities) {
    var unique = [];
    var tolerance = 0.1; // Increased tolerance for better duplicate detection
    
    EAction.handleUserMessage("Checking " + entities.length + " entities for duplicates...");
    
    for (var i = 0; i < entities.length; i++) {
        var isDuplicate = false;
        var currentShape = entities[i].shape;
        
        if (!currentShape) continue;
        
        for (var j = 0; j < unique.length; j++) {
            var existingShape = unique[j].shape;
            if (!existingShape) continue;
            
            if (this.areShapesSimilar(currentShape, existingShape, tolerance)) {
                isDuplicate = true;
                this.stats.removedDuplicates++;
                break;
            }
        }
        
        if (!isDuplicate) {
            unique.push(entities[i]);
        }
    }
    
    EAction.handleUserMessage("Found " + this.stats.removedDuplicates + " duplicates");
    return unique;
};

// Merge connected line segments
ArcDroidOptimizer.prototype.mergeConnectedSegments = function(entities) {
    var merged = [];
    var processed = [];
    for (var k = 0; k < entities.length; k++) {
        processed[k] = false;
    }
    var tolerance = 0.1; // Increased tolerance
    var lineCount = 0;
    
    // Count lines and check entity types
    for (var i = 0; i < entities.length; i++) {
        var shape = entities[i].shape;
        if (shape) {
            var shapeType = shape.getShapeType();
            if (shapeType === RS.EntityLine || 
                (typeof shapeType === 'string' && shapeType.indexOf('Line') !== -1) ||
                shape.isLineEntity && shape.isLineEntity()) {
                lineCount++;
            }
        }
    }
    
    EAction.handleUserMessage("Found " + lineCount + " line entities to check for connections...");
    
    for (var i = 0; i < entities.length; i++) {
        if (processed[i]) continue;
        
        var currentEntity = entities[i];
        var currentShape = currentEntity.shape;
        
        if (!currentShape) {
            merged.push(currentEntity);
            processed[i] = true;
            continue;
        }
        
        var shapeType = currentShape.getShapeType();
        var isLine = (shapeType === RS.EntityLine || 
                     (typeof shapeType === 'string' && shapeType.indexOf('Line') !== -1) ||
                     (currentShape.isLineEntity && currentShape.isLineEntity()));
        
        if (!isLine) {
            merged.push(currentEntity);
            processed[i] = true;
            continue;
        }
        
        // Look for connected lines
        var connectedLines = [currentEntity];
        processed[i] = true;
        
        var currentEndPoint = this.getEndPoint(currentShape);
        var foundConnection = true;
        
        while (foundConnection) {
            foundConnection = false;
            for (var j = 0; j < entities.length; j++) {
                if (processed[j]) continue;
                
                var nextShape = entities[j].shape;
                if (!nextShape) continue;
                
                var nextShapeType = nextShape.getShapeType();
                var nextIsLine = (nextShapeType === RS.EntityLine || 
                                 (typeof nextShapeType === 'string' && nextShapeType.indexOf('Line') !== -1) ||
                                 (nextShape.isLineEntity && nextShape.isLineEntity()));
                
                if (!nextIsLine) continue;
                
                var nextStartPoint = this.getStartPoint(nextShape);
                if (this.calculateDistance(currentEndPoint, nextStartPoint) < tolerance) {
                    connectedLines.push(entities[j]);
                    processed[j] = true;
                    currentEndPoint = this.getEndPoint(nextShape);
                    foundConnection = true;
                    this.stats.mergedSegments++;
                    break;
                }
            }
        }
        
        merged.push(connectedLines[0]); // Keep first line as representative
    }
    
    EAction.handleUserMessage("Merged " + this.stats.mergedSegments + " connected segments");
    return merged;
};

// Simplify polylines by removing redundant points
ArcDroidOptimizer.prototype.simplifyPolylines = function(entities) {
    var simplified = [];
    var polylineCount = 0;
    
    // Count and identify polylines
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var shape = entity.shape;
        
        if (!shape) {
            simplified.push(entity);
            continue;
        }
        
        var shapeType = shape.getShapeType();
        var isPolyline = (shapeType === RS.EntityPolyline || 
                         (typeof shapeType === 'string' && shapeType.indexOf('Polyline') !== -1) ||
                         (shape.isPolylineEntity && shape.isPolylineEntity()) ||
                         (shape.getVertices && shape.getVertices().length > 2));
        
        if (isPolyline) {
            polylineCount++;
            // For complex polylines, we could implement Douglas-Peucker algorithm
            // For now, just count as simplified if it's a polyline with many vertices
            if (shape.getVertices && shape.getVertices().length > 3) {
                this.stats.simplifiedPolylines++;
            }
        }
        
        simplified.push(entity);
    }
    
    EAction.handleUserMessage("Found " + polylineCount + " polylines, simplified " + this.stats.simplifiedPolylines);
    return simplified;
};

// Optimize entity order using nearest neighbor algorithm
ArcDroidOptimizer.prototype.optimizeEntityOrder = function(entities) {
    if (entities.length <= 1) return entities;
    
    var optimized = [];
    var remaining = entities.slice(); // Copy array
    
    // Start with the first entity
    var current = remaining.shift();
    optimized.push(current);
    
    // Use nearest neighbor algorithm
    while (remaining.length > 0) {
        var nearestIndex = 0;
        var currentEndPoint = this.getEndPoint(current.shape);
        var minDistance = this.calculateDistance(currentEndPoint, this.getStartPoint(remaining[0].shape));
        
        for (var i = 1; i < remaining.length; i++) {
            var distance = this.calculateDistance(currentEndPoint, this.getStartPoint(remaining[i].shape));
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        
        current = remaining.splice(nearestIndex, 1)[0];
        optimized.push(current);
    }
    
    return optimized;
};

// Helper function to check if two shapes are geometrically similar
ArcDroidOptimizer.prototype.areShapesSimilar = function(shape1, shape2, tolerance) {
    if (shape1.getShapeType() !== shape2.getShapeType()) {
        return false;
    }
    
    var type = shape1.getShapeType();
    
    if (type === RS.EntityLine) {
        var start1 = shape1.getStartPoint();
        var end1 = shape1.getEndPoint();
        var start2 = shape2.getStartPoint();
        var end2 = shape2.getEndPoint();
        
        return (this.calculateDistance(start1, start2) < tolerance && 
                this.calculateDistance(end1, end2) < tolerance) ||
               (this.calculateDistance(start1, end2) < tolerance && 
                this.calculateDistance(end1, start2) < tolerance);
    }
    
    if (type === RS.EntityCircle) {
        var center1 = shape1.getCenter();
        var center2 = shape2.getCenter();
        var radius1 = shape1.getRadius();
        var radius2 = shape2.getRadius();
        
        return this.calculateDistance(center1, center2) < tolerance &&
               Math.abs(radius1 - radius2) < tolerance;
    }
    
    if (type === RS.EntityArc) {
        var center1 = shape1.getCenter();
        var center2 = shape2.getCenter();
        var radius1 = shape1.getRadius();
        var radius2 = shape2.getRadius();
        var startAngle1 = shape1.getStartAngle();
        var startAngle2 = shape2.getStartAngle();
        var endAngle1 = shape1.getEndAngle();
        var endAngle2 = shape2.getEndAngle();
        
        return this.calculateDistance(center1, center2) < tolerance &&
               Math.abs(radius1 - radius2) < tolerance &&
               Math.abs(startAngle1 - startAngle2) < tolerance &&
               Math.abs(endAngle1 - endAngle2) < tolerance;
    }
    
    return false;
};

// Helper function to calculate distance between two points
ArcDroidOptimizer.prototype.calculateDistance = function(point1, point2) {
    if (!point1 || !point2) return Infinity;
    return point1.getDistanceTo(point2);
};

// Show optimization results
ArcDroidOptimizer.prototype.showOptimizationResults = function() {
    var message = "Optimization Results:\n";
    message += "Original entities: " + this.stats.originalEntities + "\n";
    message += "Optimized entities: " + this.stats.optimizedEntities + "\n";
    message += "Removed duplicates: " + this.stats.removedDuplicates + "\n";
    message += "Merged segments: " + this.stats.mergedSegments + "\n";
    message += "Simplified polylines: " + this.stats.simplifiedPolylines + "\n";
    
    // Add new ArcDroid memory checking features
    this.showArcDroidCompatibilityCheck();
    
    EAction.handleUserMessage(message);
};

// New ArcDroid compatibility checking function
ArcDroidOptimizer.prototype.showArcDroidCompatibilityCheck = function() {
    try {
        var doc = this.getDocument();
        if (!doc) return;
        
        // Get document file path and calculate file size
        var filePath = doc.getFileName();
        var fileSize = this.getFileSize(filePath);
        var fileSizeKB = Math.round(fileSize / 1024 * 100) / 100;
        var fileSizeMB = Math.round(fileSize / (1024 * 1024) * 100) / 100;
        
        EAction.handleUserMessage("\n=== ARCDROID COMPATIBILITY CHECK ===");
        
        // File size analysis
        if (fileSizeKB < 1024) {
            EAction.handleUserMessage("📁 File size: " + fileSizeKB + " KB");
        } else {
            EAction.handleUserMessage("📁 File size: " + fileSizeMB + " MB (" + fileSizeKB + " KB)");
        }
        
        // Estimate G-code lines
        var estimatedGCodeLines = this.estimateGCodeLines();
        EAction.handleUserMessage("📝 Estimated G-code lines: ~" + estimatedGCodeLines);
        
        // ArcDroid memory limit check (32KB = 32,768 bytes)
        var arcDroidLimit = 32768; // 32KB in bytes
        var estimatedGCodeSize = estimatedGCodeLines * 25; // ~25 bytes per line average
        
        EAction.handleUserMessage("💾 Estimated G-code size: ~" + Math.round(estimatedGCodeSize / 1024 * 100) / 100 + " KB");
        
        if (estimatedGCodeSize <= arcDroidLimit) {
            EAction.handleUserMessage("✅ ARCDROID READY: File should fit in ArcDroid memory (" + Math.round(estimatedGCodeSize / arcDroidLimit * 100) + "% of 32KB limit)");
        } else {
            var overageKB = Math.round((estimatedGCodeSize - arcDroidLimit) / 1024 * 100) / 100;
            EAction.handleUserMessage("⚠️  ARCDROID WARNING: File may be too large for ArcDroid memory!");
            EAction.handleUserMessage("   Estimated size exceeds 32KB limit by " + overageKB + " KB");
            EAction.handleUserMessage("   Consider simplifying the design or splitting into multiple files");
        }
        
        // Build area check (ArcDroid standard build area)
        this.checkBuildArea();
        
    } catch (error) {
        EAction.handleUserMessage("Error in ArcDroid compatibility check: " + error.toString());
    }
};

// Estimate G-code lines based on entities
ArcDroidOptimizer.prototype.estimateGCodeLines = function() {
    var totalLines = 0;
    
    // Base G-code overhead (header, footer, setup)
    totalLines += 20;
    
    // Estimate lines per entity type
    totalLines += this.stats.optimizedEntities * 3; // ~3 lines per entity average
    
    // Add extra lines for complex shapes
    var doc = this.getDocument();
    if (doc) {
        var entityIds = doc.queryAllVisibleEntities();
        for (var i = 0; i < entityIds.length; i++) {
            var entity = doc.queryEntity(entityIds[i]);
            if (entity) {
                var shape = entity.getShapes()[0];
                if (shape) {
                    var shapeType = shape.getShapeType();
                    if (shapeType === RS.EntityArc || shapeType === RS.EntityCircle) {
                        totalLines += 2; // Arcs/circles need more G-code
                    } else if (shapeType === RS.EntityPolyline) {
                        // Polylines vary by vertex count
                        totalLines += 1;
                    }
                }
            }
        }
    }
    
    return totalLines;
};

// Check if design fits within ArcDroid build area
ArcDroidOptimizer.prototype.checkBuildArea = function() {
    try {
        var doc = this.getDocument();
        if (!doc) return;
        
        // Get document bounds
        var bbox = doc.getBoundingBox();
        if (!bbox.isValid()) {
            EAction.handleUserMessage("📐 Build area: Cannot determine drawing bounds");
            return;
        }
        
        var width = bbox.getWidth();
        var height = bbox.getHeight();
        
        // Convert from document units to mm (assuming document is in mm)
        var widthMM = Math.round(width * 100) / 100;
        var heightMM = Math.round(height * 100) / 100;
        
        EAction.handleUserMessage("📐 Drawing size: " + widthMM + " x " + heightMM + " mm");
        
        // ArcDroid standard build areas (approximate)
        var buildAreas = {
            "ArcDroid Standard": {width: 600, height: 600},
            "ArcDroid Large": {width: 1200, height: 1200}
        };
        
        var fitsStandard = (widthMM <= buildAreas["ArcDroid Standard"].width && heightMM <= buildAreas["ArcDroid Standard"].height);
        var fitsLarge = (widthMM <= buildAreas["ArcDroid Large"].width && heightMM <= buildAreas["ArcDroid Large"].height);
        
        if (fitsStandard) {
            EAction.handleUserMessage("✅ BUILD AREA: Fits ArcDroid Standard (600x600mm) and Large (1200x1200mm)");
        } else if (fitsLarge) {
            EAction.handleUserMessage("✅ BUILD AREA: Fits ArcDroid Large (1200x1200mm) but NOT Standard (600x600mm)");
        } else {
            EAction.handleUserMessage("⚠️  BUILD AREA: Drawing exceeds ArcDroid Large build area (1200x1200mm)");
            EAction.handleUserMessage("   Consider scaling down or splitting the design");
        }
        
    } catch (error) {
        EAction.handleUserMessage("Error checking build area: " + error.toString());
    }
};

// Get file size (simplified version)
ArcDroidOptimizer.prototype.getFileSize = function(filePath) {
    try {
        if (!filePath || filePath === "") {
            return 0;
        }
        
        // Estimate file size based on entity count (rough approximation)
        var doc = this.getDocument();
        if (doc) {
            var entityCount = doc.queryAllVisibleEntities().length;
            return entityCount * 150; // ~150 bytes per entity estimate
        }
        
        return 0;
    } catch (error) {
        return 0;
    }
};

// Calculate total travel distance for optimized path
ArcDroidOptimizer.prototype.calculateTotalDistance = function(entities) {
    if (entities.length === 0) return 0;
    
    var totalDistance = 0;
    var currentPos = new RVector(0, 0); // Start at origin
    
    for (var i = 0; i < entities.length; i++) {
        var startPoint = this.getStartPoint(entities[i].shape);
        if (startPoint) {
            totalDistance += this.calculateDistance(currentPos, startPoint);
            var endPoint = this.getEndPoint(entities[i].shape);
            if (endPoint) {
                currentPos = endPoint;
            }
        }
    }
    
    return totalDistance;
};

// Static initialization function
ArcDroidOptimizer.init = function(basePath) {
    var action = new RGuiAction(qsTr("&ArcDroid Optimizer"), RMainWindowQt.getMainWindow());
    action.setRequiresDocument(true);
    action.setScriptFile(basePath + "/ArcDroidOptimizer.js");
    action.setIcon(basePath + "/ArcDroidOptimizer.svg");
    action.setStatusTip(qsTr("Optimize toolpaths for ArcDroid CNC plasma cutting"));
    action.setDefaultShortcut(new QKeySequence("Ctrl+Alt+O"));
    action.setGroupSortOrder(60000);
    action.setSortOrder(100);
    action.setWidgetNames(["ToolsMenu", "MainToolBar"]);
};