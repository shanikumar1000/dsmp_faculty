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

module.exports = {
  getAdminStats,
  getPublicationTrends,
  getDepartmentPerformance,
  getTopFaculty,
  getRecentActivities
};
