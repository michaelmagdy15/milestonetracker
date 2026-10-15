using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Threading;
using System.IO;
using System.Diagnostics;

namespace DecTracker
{
    class Program
    {
        const string CURRENT_VERSION = "2.0.0-firebase";

        static System.Collections.Generic.List<FileSystemWatcher> watchers = new System.Collections.Generic.List<FileSystemWatcher>();

        [DllImport("user32.dll")]
        static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        [StructLayout(LayoutKind.Sequential)]
        struct LASTINPUTINFO
        {
            public uint cbSize;
            public uint dwTime;
        }

        [DllImport("kernel32.dll")]
        static extern IntPtr GetConsoleWindow();

        [DllImport("user32.dll")]
        static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        const int SW_HIDE = 0;

        [DllImport("user32.dll")]
        static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);

        [DllImport("kernel32.dll")]
        static extern uint GetTickCount();

        static string[] WORK_PROGRAMS = new string[] {
            "AutoCAD", "Revit", "ETABS", "SAFE", "Excel", "PowerPoint", "Word",
            "SketchUp", "Lumion", "Twinmotion", "3ds Max", "Archicad",
            "Chrome", "Edge", "Brave", "Code", "Visual Studio", "Antigravity",
            "PowerShell", "Terminal", "Explorer", "Milestone Tracker"
        };

        static int IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

        static uint GetIdleTimeMs()
        {
            LASTINPUTINFO lii = new LASTINPUTINFO();
            lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));
            if (GetLastInputInfo(ref lii))
            {
                uint tick = unchecked(GetTickCount());
                uint dwTime = unchecked(lii.dwTime);
                return unchecked(tick - dwTime);
            }
            return 0;
        }

        static string GetActiveWindow()
        {
            IntPtr hwnd = GetForegroundWindow();
            StringBuilder sb = new StringBuilder(256);
            if (GetWindowText(hwnd, sb, sb.Capacity) > 0)
            {
                return sb.ToString();
            }
            return "Windows Desktop";
        }

        static bool IsWorkProgramActive(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return false;
            string lowerTitle = title.ToLower();
            foreach (string wp in WORK_PROGRAMS)
            {
                if (lowerTitle.Contains(wp.ToLower())) return true;
            }
            return true; // Default active window on workstation to work when not idle
        }

        static string EscapeJson(string str)
        {
            if (str == null) return "";
            return str.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", " ").Replace("\r", "");
        }

        static bool FirestorePatchRequest(string relativePathAndQuery, string jsonBody)
        {
            try
            {
                string url = Config.FIRESTORE_BASE_URL + "/" + relativePathAndQuery;
                string tempFile = Path.GetTempFileName();
                File.WriteAllText(tempFile, jsonBody, new UTF8Encoding(false));

                ProcessStartInfo psi = new ProcessStartInfo("curl.exe")
                {
                    Arguments = string.Format("-sS -X PATCH \"{0}\" -H \"Content-Type: application/json\" -d @\"{1}\"", url, tempFile),
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                using (Process process = Process.Start(psi))
                {
                    string stdout = process.StandardOutput.ReadToEnd();
                    string stderr = process.StandardError.ReadToEnd();
                    process.WaitForExit();
                    int exitCode = process.ExitCode;
                    try { File.Delete(tempFile); } catch { }

                    if (exitCode == 0 && !stdout.Contains("\"error\":"))
                    {
                        Console.WriteLine("[Firestore OK] " + relativePathAndQuery);
                        return true;
                    }
                    else
                    {
                        throw new Exception("curl exit=" + exitCode + " err=" + stderr + " out=" + stdout);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("[Firestore Error] " + ex.Message);
                try
                {
                    File.AppendAllText("tracker_debug.log", "[" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "] " + ex.Message + "\n");
                }
                catch { }
                return false;
            }
        }

        static bool PostAppUsageLog(string activeWindow, int durationSeconds, string timestampIso, string documentName)
        {
            string logId = "log-" + Guid.NewGuid().ToString();
            string safeWindow = EscapeJson(activeWindow);
            string safeDoc = EscapeJson(documentName ?? "");

            string body = "{" +
                "\"fields\":{" +
                    "\"id\":{\"stringValue\":\"" + logId + "\"}," +
                    "\"organization_id\":{\"stringValue\":\"" + Config.ORGANIZATION_ID + "\"}," +
                    "\"engineer_id\":{\"stringValue\":\"" + Config.ENGINEER_ID + "\"}," +
                    "\"active_window\":{\"stringValue\":\"" + safeWindow + "\"}," +
                    "\"duration_seconds\":{\"integerValue\":\"" + durationSeconds + "\"}," +
                    "\"timestamp\":{\"stringValue\":\"" + timestampIso + "\"}," +
                    "\"document_name\":{\"stringValue\":\"" + safeDoc + "\"}" +
                "}" +
            "}";

            return FirestorePatchRequest("mt_app_usage_log/" + logId, body);
        }

        static bool CreateTimeEntry(string entryId, string entryType, string startIso)
        {
            string body = "{" +
                "\"fields\":{" +
                    "\"id\":{\"stringValue\":\"" + entryId + "\"}," +
                    "\"organization_id\":{\"stringValue\":\"" + Config.ORGANIZATION_ID + "\"}," +
                    "\"engineer_id\":{\"stringValue\":\"" + Config.ENGINEER_ID + "\"}," +
                    "\"entry_type\":{\"stringValue\":\"" + entryType + "\"}," +
                    "\"start_time\":{\"stringValue\":\"" + startIso + "\"}," +
                    "\"end_time\":{\"stringValue\":\"" + startIso + "\"}," +
                    "\"created_at\":{\"stringValue\":\"" + startIso + "\"}" +
                "}" +
            "}";

            return FirestorePatchRequest("mt_time_entries/" + entryId, body);
        }

        static bool UpdateTimeEntryEndTime(string entryId, string endIso)
        {
            string body = "{" +
                "\"fields\":{" +
                    "\"end_time\":{\"stringValue\":\"" + endIso + "\"}" +
                "}" +
            "}";

            return FirestorePatchRequest("mt_time_entries/" + entryId + "?updateMask.fieldPaths=end_time", body);
        }

        static void ReportTrackerVersion()
        {
            string body = "{" +
                "\"fields\":{" +
                    "\"tracker_version\":{\"stringValue\":\"" + CURRENT_VERSION + "\"}" +
                "}" +
            "}";

            FirestorePatchRequest("mt_engineers/" + Config.ENGINEER_ID + "?updateMask.fieldPaths=tracker_version", body);
        }

        static string ExtractDocumentName(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return "";
            string[] parts = title.Split(new string[] { " - " }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length > 0)
            {
                string doc = parts[0].Trim();
                if (doc.StartsWith("[") && doc.EndsWith("]"))
                {
                    doc = doc.Substring(1, doc.Length - 2);
                }
                return doc;
            }
            return "";
        }

        static void SetupDeliverableWatcher()
        {
            string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            string[] folders = new string[]
            {
                "C:\\Projects\\Exports",
                Path.Combine(userProfile, "Desktop"),
                Path.Combine(userProfile, "Documents"),
                Path.Combine(userProfile, "Downloads")
            };

            foreach (string folder in folders)
            {
                try
                {
                    if (!Directory.Exists(folder)) continue;

                    var watcher = new FileSystemWatcher(folder);
                    watcher.NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite;
                    watcher.Filter = "*.*";
                    watcher.IncludeSubdirectories = false;
                    watcher.Created += (s, e) => OnDeliverableExported(s, e);
                    watcher.EnableRaisingEvents = true;
                    watchers.Add(watcher);
                    Console.WriteLine("Watching for deliverables in: " + folder);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Watcher failed for " + folder + ": " + ex.Message);
                }
            }
        }

        static void OnDeliverableExported(object sender, FileSystemEventArgs e)
        {
            try
            {
                string ext = Path.GetExtension(e.FullPath).ToLower();
                if (ext == ".pdf" || ext == ".dwg" || ext == ".rvt")
                {
                    string nowIso = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    PostAppUsageLog("Deliverable Exported: " + e.Name, 0, nowIso, e.Name);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Deliverable Watcher Error: " + ex.Message);
            }
        }

        static void Main(string[] args)
        {
            bool hideWindow = true;
            if (args != null && args.Length > 0 && args[0] == "--console")
            {
                hideWindow = false;
            }

            if (hideWindow)
            {
                var handle = GetConsoleWindow();
                if (handle != IntPtr.Zero)
                {
                    ShowWindow(handle, SW_HIDE);
                }
            }

            Console.WriteLine("================================================");
            Console.WriteLine(" Milestone Tracker Desktop Agent (" + CURRENT_VERSION + ")");
            Console.WriteLine(" Engineer ID:     " + Config.ENGINEER_ID);
            Console.WriteLine(" Organization ID: " + Config.ORGANIZATION_ID);
            Console.WriteLine(" Firebase Target: " + Config.FIREBASE_PROJECT_ID);
            Console.WriteLine("================================================");

            ReportTrackerVersion();
            SetupDeliverableWatcher();

            // Log initial heartbeat right on startup so Live Operations Central shows online immediately
            string initialWindow = GetActiveWindow();
            string startupIso = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            PostAppUsageLog(
                string.IsNullOrWhiteSpace(initialWindow) ? "Active Workstation Session" : initialWindow,
                10,
                startupIso,
                ExtractDocumentName(initialWindow)
            );

            string current_entry_id = null;
            string current_state = null;
            string last_window = initialWindow;
            DateTime last_window_time = DateTime.UtcNow;
            DateTime last_timeclock_update_time = DateTime.UtcNow;
            DateTime last_heartbeat_time = DateTime.UtcNow;

            while (true)
            {
                try
                {
                    uint idle_ms = GetIdleTimeMs();
                    bool is_idle = idle_ms > IDLE_THRESHOLD_MS;
                    string raw_window_title = GetActiveWindow();
                    bool is_work = IsWorkProgramActive(raw_window_title);

                    DateTime now = DateTime.UtcNow;
                    string now_iso = now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

                    if (raw_window_title != last_window)
                    {
                        if (!string.IsNullOrWhiteSpace(last_window))
                        {
                            int duration_seconds = (int)(now - last_window_time).TotalSeconds;
                            if (duration_seconds >= 5 && !is_idle)
                            {
                                string docName = ExtractDocumentName(last_window);
                                PostAppUsageLog(last_window, duration_seconds, now_iso, docName);
                                last_heartbeat_time = now;
                            }
                        }
                        last_window = raw_window_title;
                        last_window_time = now;
                    }
                    else if (!is_idle && (now - last_heartbeat_time).TotalSeconds >= 60)
                    {
                        // Periodic heartbeat if staying in the same window for >60s
                        int duration_seconds = (int)(now - last_window_time).TotalSeconds;
                        string docName = ExtractDocumentName(raw_window_title);
                        PostAppUsageLog(raw_window_title, duration_seconds, now_iso, docName);
                        last_heartbeat_time = now;
                        last_window_time = now;
                    }

                    string new_state = "break";
                    if (is_idle) new_state = "break";
                    else if (is_work) new_state = "work";

                    if (current_state != new_state)
                    {
                        string new_id = "te-" + Guid.NewGuid().ToString();
                        if (CreateTimeEntry(new_id, new_state, now_iso))
                        {
                            current_entry_id = new_id;
                            current_state = new_state;
                            last_timeclock_update_time = now;
                        }
                    }
                    else
                    {
                        if (current_entry_id != null && (now - last_timeclock_update_time).TotalSeconds >= 30)
                        {
                            UpdateTimeEntryEndTime(current_entry_id, now_iso);
                            last_timeclock_update_time = now;
                        }
                    }
                }
                catch (Exception ex)
                {
                    try
                    {
                        File.AppendAllText("tracker_debug.log", "[" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "] Main Loop Error: " + ex.Message + "\n");
                    }
                    catch { }
                }

                Thread.Sleep(10000);
            }
        }
    }
}
