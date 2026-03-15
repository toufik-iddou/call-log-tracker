package com.example.callcentermonitor

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class HeartbeatService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var isServiceRunning = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!isServiceRunning) {
            isServiceRunning = true
            startForegroundService()
            startHeartbeatLoop()
        }
        return START_STICKY
    }

    private fun startForegroundService() {
        val channelId = "HeartbeatChannel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Agent Status Tracking",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Call Monitor Active")
            .setContentText("Keeping you online to track call logs.")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(2002, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(2002, notification)
        }
    }

    private fun startHeartbeatLoop() {
        serviceScope.launch {
            while (isServiceRunning) {
                try {
                    val success = ApiService.sendHeartbeat(this@HeartbeatService)
                    Log.d("HeartbeatService", "Heartbeat sent. Success: $success")
                } catch (e: Exception) {
                    Log.e("HeartbeatService", "Heartbeat error: ${e.message}")
                }
                delay(60000) // 1 minute
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
        serviceJob.cancel()
    }
}
