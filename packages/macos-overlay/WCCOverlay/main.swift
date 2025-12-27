import Cocoa

// Entry point
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate

// Activate as accessory (no dock icon, no menu bar)
app.setActivationPolicy(.accessory)

// Run
_ = NSApplicationMain(CommandLine.argc, CommandLine.unsafeArgv)
