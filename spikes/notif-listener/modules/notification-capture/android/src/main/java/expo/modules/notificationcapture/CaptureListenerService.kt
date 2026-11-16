package expo.modules.notificationcapture

import android.app.Notification
import android.content.ComponentName
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import org.json.JSONObject

/**
 * Spike listener: stores the full content of notifications posted by the
 * packages the user selected. Every other notification is ignored and never stored.
 * Lifecycle events are logged too, to see whether the system keeps the service alive.
 */
class CaptureListenerService : NotificationListenerService() {

  override fun onCreate() {
    super.onCreate()
    CaptureStore.appendLifecycle(this, "service_created")
  }

  override fun onDestroy() {
    CaptureStore.listenerConnected = false
    CaptureStore.appendLifecycle(this, "service_destroyed")
    super.onDestroy()
  }

  override fun onListenerConnected() {
    CaptureStore.listenerConnected = true
    CaptureStore.appendLifecycle(this, "listener_connected")
  }

  override fun onListenerDisconnected() {
    CaptureStore.listenerConnected = false
    CaptureStore.appendLifecycle(this, "listener_disconnected")
    requestRebind(ComponentName(this, CaptureListenerService::class.java))
  }

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    if (sbn.packageName !in CaptureStore.getPackages(this)) return
    try {
      CaptureStore.append(this, toJson(sbn))
    } catch (e: Exception) {
      CaptureStore.append(
        this,
        JSONObject()
          .put("kind", "error")
          .put("at", System.currentTimeMillis())
          .put("package", sbn.packageName)
          .put("message", e.toString())
      )
    }
  }

  private fun toJson(sbn: StatusBarNotification): JSONObject {
    val n = sbn.notification
    val json = JSONObject()
      .put("kind", "notification")
      .put("at", System.currentTimeMillis())
      .put("package", sbn.packageName)
      .put("postTime", sbn.postTime)
      .put("when", n.`when`)
      .put("key", sbn.key)
      .put("id", sbn.id)
      .put("tag", sbn.tag ?: JSONObject.NULL)
      .put("channelId", n.channelId ?: JSONObject.NULL)
      .put("category", n.category ?: JSONObject.NULL)
      .put("group", n.group ?: JSONObject.NULL)
      .put("isGroupSummary", n.flags and Notification.FLAG_GROUP_SUMMARY != 0)
      .put("isOngoing", sbn.isOngoing)
      .put("tickerText", n.tickerText?.toString() ?: JSONObject.NULL)
    json.put("extras", extrasToJson(n.extras))
    return json
  }

  /** Dumps every text-like extra so the spike shows exactly what each bank sends. */
  @Suppress("DEPRECATION")
  private fun extrasToJson(extras: Bundle?): JSONObject {
    val out = JSONObject()
    if (extras == null) return out
    for (key in extras.keySet()) {
      val value = try {
        extras.get(key)
      } catch (_: Exception) {
        null
      }
      when (value) {
        is CharSequence -> out.put(key, value.toString())
        is Boolean, is Int, is Long -> out.put(key, value)
        is Array<*> -> {
          val items = JSONArray()
          for (item in value) {
            when (item) {
              is CharSequence -> items.put(item.toString())
              is Bundle -> items.put(extrasToJson(item))
            }
          }
          if (items.length() > 0) out.put(key, items)
        }
        else -> {}
      }
    }
    return out
  }
}
