/**
 * 14-Day Realistic Clinical Sample Data Generator
 * Simulates real patient readings: fasting, post-breakfast, post-lunch, post-dinner,
 * exercises, and occasional mild highs/lows for clinical AGP demonstration.
 */

export function generateSampleData() {
  const now = Date.now()
  const DAY_MS = 24 * 60 * 60 * 1000

  const sampleGlucoseLogs = []
  const sampleExerciseLogs = []

  // Generate 14 days of entries
  for (let d = 13; d >= 0; d--) {
    const dayTimestamp = now - d * DAY_MS
    const dateObj = new Date(dayTimestamp)

    // Fasting (8:00 AM)
    const fastingTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 8, 15).toISOString()
    const fastingVal = Math.round(92 + (Math.random() * 24 - 10)) // ~85-110
    sampleGlucoseLogs.push({
      id: `sample-g-${d}-fasting`,
      glucose_value: fastingVal,
      reading_type: 'Fasting',
      type: 'Fasting',
      carbs: null,
      insulin: null,
      notes: 'Morning wakeup reading',
      measured_at: fastingTime,
      created_at: fastingTime
    })

    // Post-Breakfast (10:30 AM)
    const bfastTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 10, 30).toISOString()
    const bfastVal = Math.round(135 + (Math.random() * 35 - 15)) // ~120-160
    sampleGlucoseLogs.push({
      id: `sample-g-${d}-bfast`,
      glucose_value: bfastVal,
      reading_type: 'After Meal',
      type: 'After Meal',
      carbs: 35,
      insulin: 2.5,
      notes: 'Poha with peanuts & tea',
      measured_at: bfastTime,
      created_at: bfastTime
    })

    // Post-Lunch (2:30 PM)
    const lunchTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 14, 30).toISOString()
    // occasional spike on weekends
    const isSpikeDay = d === 2 || d === 8
    const lunchVal = isSpikeDay ? Math.round(188 + Math.random() * 25) : Math.round(142 + (Math.random() * 30 - 15))
    sampleGlucoseLogs.push({
      id: `sample-g-${d}-lunch`,
      glucose_value: lunchVal,
      reading_type: 'After Meal',
      type: 'After Meal',
      carbs: isSpikeDay ? 65 : 42,
      insulin: isSpikeDay ? 4.5 : 3.0,
      notes: isSpikeDay ? 'Rice with paneer & sweet' : '2 Roti, Toor Dal & salad',
      measured_at: lunchTime,
      created_at: lunchTime
    })

    // Post-Dinner (9:30 PM)
    const dinnerTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 21, 30).toISOString()
    const dinnerVal = Math.round(128 + (Math.random() * 30 - 15))
    sampleGlucoseLogs.push({
      id: `sample-g-${d}-dinner`,
      glucose_value: dinnerVal,
      reading_type: 'After Meal',
      type: 'After Meal',
      carbs: 30,
      insulin: 2.0,
      notes: 'Khichdi and curd',
      measured_at: dinnerTime,
      created_at: dinnerTime
    })

    // Exercise on most days
    if (d % 2 === 0) {
      const exTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 18, 0).toISOString()
      sampleExerciseLogs.push({
        id: `sample-ex-${d}`,
        activity: d % 4 === 0 ? 'Brisk Walking' : 'Yoga & Stretching',
        duration_minutes: 30,
        notes: 'Evening post-snack workout',
        performed_at: exTime,
        created_at: exTime
      })
    }
  }

  return {
    glucoseLogs: sampleGlucoseLogs.sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at)),
    exerciseLogs: sampleExerciseLogs.sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at))
  }
}
