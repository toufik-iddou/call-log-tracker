package com.example.callcentermonitor

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class HeartbeatWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val TAG = "HeartbeatWorker"
    }

    override suspend fun doWork(): Result {
        val prefs = applicationContext.getSharedPreferences("CallMonitorPrefs", Context.MODE_PRIVATE)
        val token = prefs.getString("token", "") ?: ""
        val serverUrl = prefs.getString("serverUrl", "https://call-log-tracker.vercel.app") ?: "https://call-log-tracker.vercel.app"

        if (token.isEmpty()) {
            Log.d(TAG, "No token found — agent is logged out. Skipping ping.")
            return Result.success()
        }

        return withContext(Dispatchers.IO) {
            try {
                val client = OkHttpClient()
                val jsonMediaType = "application/json; charset=utf-8".toMediaType()
                val body = "{}".toRequestBody(jsonMediaType)
                val request = Request.Builder()
                    .url("$serverUrl/api/agent/ping")
                    .header("Authorization", "Bearer $token")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    Log.d(TAG, "Ping sent. Response code: ${response.code}")
                }
                Result.success()
            } catch (e: Exception) {
                Log.w(TAG, "Ping failed, will retry: ${e.message}")
                Result.retry()
            }
        }
    }
}
