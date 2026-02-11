const { exec } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const analyzePerformance = async (req, res) => {
  try {
    const { faculty_id } = req.body;

    if (!faculty_id || faculty_id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID required'
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_publications, total_citations')
      .eq('id', faculty_id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('activity_type')
      .eq('user_id', faculty_id);

    if (activitiesError) throw activitiesError;

    const workshops = activities ? activities.filter(a =>
      a.activity_type === 'Workshop' ||
      a.activity_type === 'Seminar' ||
      a.activity_type === 'FDP / Training' ||
      a.activity_type === 'Guest Lecture'
    ).length : 0;

    const projects = activities ? activities.filter(a =>
      a.activity_type === 'Project'
    ).length : 0;

    const inputData = {
      publications: profile.total_publications || 0,
      citations: profile.total_citations || 0,
      workshops: workshops,
      projects: projects
    };

    const scriptPath = path.join(__dirname, '../ai_score.py');
    const inputJSON = JSON.stringify(inputData);

    exec(`python3 "${scriptPath}" '${inputJSON}'`, async (error, stdout, stderr) => {
      if (error) {
        console.error('AI scoring error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to analyze performance'
        });
      }

      try {
        const aiResult = JSON.parse(stdout);

        if (!aiResult.success) {
          return res.status(400).json({
            success: false,
            message: 'AI analysis failed'
          });
        }

        const { score, category } = aiResult;

        await supabase
          .from('profiles')
          .update({
            performance_score: score,
            performance_category: category,
            last_analyzed_at: new Date().toISOString()
          })
          .eq('id', faculty_id);

        console.log(`Performance analyzed for faculty: ${faculty_id} - Score: ${score}, Category: ${category}`);

        res.json({
          success: true,
          score,
          category
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({
          success: false,
          message: 'Failed to process AI analysis'
        });
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  analyzePerformance
};
