package expo.modules.notificationcapture

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * Spike storage: one JSON object per line in the app's private files dir.
 * Nothing leaves the device unless the user exports it.
 */
object CaptureStore {
  private const val PREFS = "capture_prefs"
  private const val KEY_PACKAGES = "packages"
  private const val LOG_FILE = "captured.jsonl"
  private val lock = Any()

  @Volatile
  var listenerConnected: Boolean = false

  fun getPackages(context: Context): Set<String> =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .getStringSet(KEY_PACKAGES, emptySet())
      ?.toSet() ?: emptySet()

  fun setPackages(context: Context, packages: List<String>) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .putStringSet(KEY_PACKAGES, packages.toSet())
      .apply()
  }

  fun append(context: Context, entry: JSONObject) {
    synchronized(lock) {
      File(context.filesDir, LOG_FILE).appendText(entry.toString() + "\n")
    }
  }

  fun appendLifecycle(context: Context, event: String) {
    append(
      context,
      JSONObject()
        .put("kind", "lifecycle")
        .put("event", event)
        .put("at", System.currentTimeMillis())
    )
  }

  fun readRaw(context: Context): String {
    synchronized(lock) {
      val file = File(context.filesDir, LOG_FILE)
      return if (file.exists()) file.readText() else ""
    }
  }

  fun clear(context: Context) {
    synchronized(lock) {
      File(context.filesDir, LOG_FILE).delete()
    }
  }

  /** Writes a pretty-printed JSON copy to the cache dir and returns it. */
  fun exportToCache(context: Context): File {
    val array = JSONArray()
    readRaw(context).lineSequence().filter { it.isNotBlank() }.forEach {
      try {
        array.put(JSONObject(it))
      } catch (_: Exception) {
        array.put(JSONObject().put("kind", "unparsed").put("line", it))
      }
    }
    val out = File(context.cacheDir, "capturas-${System.currentTimeMillis()}.json")
    out.writeText(array.toString(2))
    return out
  }
}
