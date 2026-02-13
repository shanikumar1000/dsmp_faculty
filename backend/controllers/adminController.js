const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getAdminStats = async (req, res) => {
  try {
    const { count: totalFaculty } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'faculty');

    const { data: facultyData } = await supabase
      .from('profiles')
      .select('total_publications')
      .eq('role', 'faculty');

    const totalPublications = facultyData
      ? facultyData.reduce((sum, f) => sum + (f.total_publications || 0), 0)
      : 0;

    const { count: pendingActivities } = await supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: performanceData } = await supabase
      .from('profiles')
      .select('performance_score')
      .eq('role', 'faculty')
      .not('performance_score', 'is', null);

    const avgPerformance = performanceData && performanceData.length > 0
      ? (performanceData.reduce((sum, f) => sum + f.performance_score, 0) / performanceData.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalFaculty: totalFaculty || 0,
        totalPublications,
        pendingActivities: pendingActivities || 0,
        avgPerformance
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

const getPublicationTrends = async (req, res) => {
  try {
    const { data: publications } = await supabase
      .from('publications')
      .select('year');

    const yearCounts = {};

    if (publications) {
      publications.forEach(pub => {
        const year = pub.year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      });
    }

    const trends = Object.keys(yearCounts)
      .sort()
      .map(year => ({
        year: parseInt(year),
        count: yearCounts[year]
      }));

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Publication trends error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trends' });
  }
};

const getDepartmentPerformance = async (req, res) => {
  try {
    const { data: facultyData } = await supabase
      .from('profiles')
      .select('department, performance_score')
      .eq('role', 'faculty')
      .not('performance_score', 'is', null);

    const deptMap = {};

    if (facultyData) {
      facultyData.forEach(faculty => {
        const dept = faculty.department;
        if (!deptMap[dept]) {
          deptMap[dept] = { total: 0, count: 0 };
        }
        deptMap[dept].total += faculty.performance_score;
        deptMap[dept].count += 1;
      });
    }

    const performance = Object.keys(deptMap).map(dept => ({
      department: dept,
      avgScore: (deptMap[dept].total / deptMap[dept].count).toFixed(1)
    }));

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Department performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch department performance' });
  }
};

const getTopFaculty = async (req, res) => {
  try {
    const { data: topFaculty } = await supabase
      .from('profiles')
      .select('full_name, department, total_publications, total_citations, performance_score')
      .eq('role', 'faculty')
      .not('performance_score', 'is', null)
      .order('performance_score', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: topFaculty || []
    });
  } catch (error) {
    console.error('Top faculty error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top faculty' });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    const { data: activities } = await supabase
      .from('activities')
      .select(`
        id,
        activity_type,
        title,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!activities || activities.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const userIds = [...new Set(activities.map(a => a.user_id))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    const profileMap = {};
    if (profiles) {
      profiles.forEach(p => {
        profileMap[p.id] = p.full_name;
      });
    }

    const enrichedActivities = activities.map(activity => ({
      id: activity.id,
      facultyName: profileMap[activity.user_id] || 'Unknown',
      activityType: activity.activity_type,
      title: activity.title,
      createdAt: activity.created_at
    }));

    res.json({
      success: true,
      data: enrichedActivities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activities' });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { full_name, email, department, designation, employee_id, google_scholar_id } = req.body;

    if (!full_name || !email || !department || !designation || !employee_id) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    // Check if employee_id already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', employee_id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Employee ID already exists.' });
    }

    // Create auth user with a temporary password
    const tempPassword = `Temp@${Date.now()}`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return res.status(400).json({ success: false, message: authError.message });
    }

    // Insert profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        email,
        department,
        designation,
        employee_id,
        google_scholar_id: google_scholar_id || null,
        role: 'faculty'
      });

    if (profileError) {
      // Rollback: delete the auth user if profile insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error('Profile creation error:', profileError);
      return res.status(400).json({ success: false, message: profileError.message });
    }

    res.json({ success: true, message: 'Faculty created successfully.' });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ success: false, message: 'Failed to create faculty.' });
  }
};

const getAllFaculty = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'faculty')
      .order('full_name', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get all faculty error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty.' });
  }
};

const getAllActivities = async (req, res) => {
  try {
    // Fetch all activities
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (actError) throw actError;

    if (!activities || activities.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Fetch all profiles for mapping faculty names
    const userIds = [...new Set(activities.map(a => a.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, department, employee_id')
      .in('id', userIds);

    const profileMap = {};
    if (profiles) {
      profiles.forEach(p => {
        profileMap[p.id] = { full_name: p.full_name, department: p.department, employee_id: p.employee_id };
      });
    }

    // Merge activities with profile data
    const enriched = activities.map(a => ({
      ...a,
      profiles: profileMap[a.user_id] || { full_name: 'Unknown', department: '', employee_id: '' }
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Get all activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities.' });
  }
};

const updateActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const { error } = await supabase
      .from('activities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: `Activity ${status} successfully.` });
  } catch (error) {
    console.error('Update activity status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update activity status.' });
  }
};

module.exports = {
  getAdminStats,
  getPublicationTrends,
  getDepartmentPerformance,
  getTopFaculty,
  getRecentActivities,
  createFaculty,
  getAllFaculty,
  getAllActivities,
  updateActivityStatus
};
