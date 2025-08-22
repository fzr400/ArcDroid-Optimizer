/**
 * Test Enhanced ArcDroid Optimizer - Direct Load
 * Copy and paste this entire script into QCAD's Script Window to test the enhanced features
 */

qDebug("=== TESTING ENHANCED ARCDROID OPTIMIZER ===");
qDebug("Loading enhanced optimizer with memory checking...");

try {
    // Load the enhanced optimizer directly
    include("D:/Dropbox (Personal)/Dropbox (Personal)/Dropbox (Personal)/DXF Optimizer/src/ArcDroidOptimizer.js");
    
    qDebug("✓ Enhanced optimizer loaded successfully");
    
    // Check if we have a document open
    var doc = getDocumentInterface();
    if (!doc) {
        qDebug("❌ No document open. Please open a DXF file first.");
        qDebug("\nTo test:");
        qDebug("1. Open a DXF file in QCAD");
        qDebug("2. Run this script again");
    } else {
        qDebug("✓ Document found, running enhanced optimizer...");
        
        // Create and run the optimizer
        var optimizer = new ArcDroidOptimizer();
        optimizer.runMenuOptimizer();
        
        qDebug("\n🎉 ENHANCED OPTIMIZER TEST COMPLETE! 🎉");
        qDebug("\nYou should now see:");
        qDebug("- File size comparison (before/after)");
        qDebug("- ArcDroid memory compatibility check");
        qDebug("- G-code line count estimation");
        qDebug("- Memory usage warnings if applicable");
        qDebug("- 'Ready to cut' or 'Too large for ArcDroid' messages");
    }
    
} catch (e) {
    qDebug("❌ Error testing enhanced optimizer: " + e.toString());
    qDebug("\nTroubleshooting:");
    qDebug("1. Make sure the file path is correct");
    qDebug("2. Verify src/ArcDroidOptimizer.js exists");
    qDebug("3. Try running from QCAD's Script Window");
}

qDebug("\n=== TEST SCRIPT COMPLETE ===");
qDebug("\nIf you see the enhanced features working, you can install permanently using:");
qDebug("install_enhanced_optimizer.bat (run as administrator)");