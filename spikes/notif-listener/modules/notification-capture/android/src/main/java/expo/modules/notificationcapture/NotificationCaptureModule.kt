package expo.modules.notificationcapture

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.service.notification.NotificationListenerService
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationCaptureModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("NotificationCapture")

    Function("getStatus") {
      val ctx = context
      val enabled = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
        ?.split(":")
        ?.any { ComponentName.unflattenFromString(it)?.packageName == ctx.packageName }
        ?: false
      val power = ctx.getSystemService(Context.POWER_SERVICE) as PowerManager
      mapOf(
        "listenerEnabled" to enabled,
        "listenerConnected" to CaptureStore.listenerConnected,
        "ignoringBatteryOptimizations" to power.isIgnoringBatteryOptimizations(ctx.packageName),
        "manufacturer" to Build.MANUFACTURER,
        "model" to Build.MODEL,
        "androidRelease" to Build.VERSION.RELEASE,
        "sdkInt" to Build.VERSION.SDK_INT,
        "buildDisplay" to Build.DISPLAY
      )
    }

    // Returns true when the settings screen could be opened.
    Function("openSettings") { target: String ->
      val ctx = context
      val pkgUri = Uri.parse("package:${ctx.packageName}")
      val intent = when (target) {
        "listener" -> Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        "appDetails" -> Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkgUri)
        "batteryRequest" -> Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, pkgUri)
        "batteryList" -> Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
        // Xiaomi screens: unverified component names, part of what the spike checks.
        "xiaomiAutostart" -> Intent().setComponent(
          ComponentName(
            "com.miui.securitycenter",
            "com.miui.permcenter.autostart.AutoStartManagementActivity"
          )
        )
        "xiaomiBattery" -> Intent().setComponent(
          ComponentName(
            "com.miui.powerkeeper",
            "com.miui.powerkeeper.ui.HiddenAppsConfigActivity"
          )
        ).putExtra("package_name", ctx.packageName).putExtra("package_label", "CC Spike")
        else -> null
      }
      if (intent == null) {
        false
      } else {
        try {
          ctx.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
          true
        } catch (_: Exception) {
          false
        }
      }
    }

    Function("requestRebind") {
      val ctx = context
      NotificationListenerService.requestRebind(
        ComponentName(ctx, CaptureListenerService::class.java)
      )
    }

    AsyncFunction("getInstalledApps") {
      val pm = context.packageManager
      val launcher = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      pm.queryIntentActivities(launcher, 0)
        .map {
          mapOf(
            "packageName" to it.activityInfo.packageName,
            "label" to it.loadLabel(pm).toString()
          )
        }
        .distinctBy { it["packageName"] }
        .sortedBy { it["label"]?.lowercase() }
    }

    Function("getWatchedPackages") {
      CaptureStore.getPackages(context).toList()
    }

    Function("setWatchedPackages") { packages: List<String> ->
      CaptureStore.setPackages(context, packages)
    }

    AsyncFunction("readLog") {
      CaptureStore.readRaw(context)
    }

    AsyncFunction("clearLog") {
      CaptureStore.clear(context)
    }

    AsyncFunction("exportLog") {
      Uri.fromFile(CaptureStore.exportToCache(context)).toString()
    }
  }
}
