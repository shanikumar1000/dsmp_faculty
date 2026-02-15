const { supabase } = require('../lib/supabase');

const getUserIdByFacultyId = async (faculty_id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('employee_id', faculty_id)
    .eq('role', 'faculty')
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
};

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

    const user_id = await getUserIdByFacultyId(faculty_id);
    if (!user_id) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    // Map type to Supabase activity_type (Publication, Seminar, Workshop, Project, Guest Lecture, FDP / Training)
    const activityType = type.replace(/^FDP\/?Training$/i, 'FDP / Training');
    const validTypes = ['Publication', 'Seminar', 'Workshop', 'Project', 'Guest Lecture', 'FDP / Training'];
    const activity_type = validTypes.includes(activityType) ? activityType : 'Seminar';

    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        user_id,
        activity_type,
        title,
        description: description || '',
        activity_data: { date, proof_link: proof_link || null },
        status: 'pending',
      })
      .select('id, created_at, updated_at')
      .single();

    if (error) {
      console.error('❌ Activity creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create activity',
        error: error.message,
      });
    }

    const activityData = {
      id: activity.id,
      faculty_id,
      type: activity_type,
      title,
      date,
      description: description || null,
      proof_link: proof_link || null,
      status: 'pending',
      created_at: activity.created_at,
      updated_at: activity.updated_at,
    };

    console.log('✅ Activity created successfully');
    console.log(`   Activity ID: ${activity.id}`);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activityData,
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

    const user_id = await getUserIdByFacultyId(faculty_id);
    if (!user_id) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (activities || []).map((a) => ({
      id: a.id,
      faculty_id,
      type: a.activity_type,
      title: a.title,
      date: a.activity_data?.date || a.created_at?.split('T')[0] || null,
      description: a.description || null,
      proof_link: a.activity_data?.proof_link || null,
      status: a.status,
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));

    console.log('✅ Activities fetched successfully');
    console.log(`   Count: ${mapped.length}`);

    res.status(200).json({
      success: true,
      message: activities?.length ? 'Activities fetched successfully' : 'No activities found',
      data: mapped,
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
