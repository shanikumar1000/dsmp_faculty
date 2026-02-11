const { db } = require('../firebase/config');

const createActivity = async (req, res) => {
  try {
    const { faculty_id, type, title, date, description, proof_link } = req.body;

    console.log('📝 Creating activity');
    console.log(`   Faculty ID: ${faculty_id}`);
    console.log(`   Type: ${type}`);
    console.log(`   Title: ${title}`);

    if (!faculty_id || !type || !title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID, type, title, and date are required',
      });
    }

    const activityData = {
      faculty_id,
      type,
      title,
      date,
      description: description || null,
      proof_link: proof_link || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const activityRef = await db.collection('activities').add(activityData);

    console.log('✅ Activity created successfully');
    console.log(`   Activity ID: ${activityRef.id}`);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: {
        id: activityRef.id,
        ...activityData,
      },
    });
  } catch (error) {
    console.error('❌ Error creating activity:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message,
    });
  }
};

const getActivitiesByFaculty = async (req, res) => {
  try {
    const { faculty_id } = req.params;

    console.log('🔍 Fetching activities for faculty');
    console.log(`   Faculty ID: ${faculty_id}`);

    const activitiesSnapshot = await db
      .collection('activities')
      .where('faculty_id', '==', faculty_id)
      .orderBy('created_at', 'desc')
      .get();

    if (activitiesSnapshot.empty) {
      console.log('⚠️  No activities found for this faculty');
      return res.status(200).json({
        success: true,
        message: 'No activities found',
        data: [],
      });
    }

    const activities = [];
    activitiesSnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log('✅ Activities fetched successfully');
    console.log(`   Count: ${activities.length}`);

    res.status(200).json({
      success: true,
      message: 'Activities fetched successfully',
      data: activities,
    });
  } catch (error) {
    console.error('❌ Error fetching activities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message,
    });
  }
};

module.exports = { createActivity, getActivitiesByFaculty };
