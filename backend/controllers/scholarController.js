const { exec } = require('child_process');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const syncScholarData = async (req, res) => {
  try {
    const { faculty_id, scholar_id } = req.body;

    if (!scholar_id || scholar_id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Scholar ID required'
      });
    }

    const scriptPath = path.join(__dirname, '../scholar_fetch.py');

    exec(`python3 "${scriptPath}" "${scholar_id}"`, async (error, stdout, stderr) => {
      if (error) {
        console.error('Scholar fetch error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch Scholar data. Check Scholar ID and try again.'
        });
      }

      try {
        const scholarData = JSON.parse(stdout);

        if (!scholarData.success) {
          return res.status(400).json({
            success: false,
            message: 'Failed to fetch Scholar data. Check Scholar ID and try again.'
          });
        }

        const { total_publications, total_citations, h_index, publications } = scholarData;

        await supabase
          .from('profiles')
          .update({
            h_index: h_index || 0,
            total_publications: total_publications || 0,
            total_citations: total_citations || 0,
            last_scholar_sync: new Date().toISOString()
          })
          .eq('id', faculty_id);

        if (publications && publications.length > 0) {
          const existingPubs = await supabase
            .from('publications')
            .select('id')
            .eq('user_id', faculty_id);

          if (existingPubs.data && existingPubs.data.length > 0) {
            await supabase
              .from('publications')
              .delete()
              .eq('user_id', faculty_id);
          }

          const pubsToInsert = publications.map(pub => ({
            user_id: faculty_id,
            title: pub.title,
            journal_conference: pub.journal,
            year: parseInt(pub.year) || new Date().getFullYear(),
            doi_link: pub.doi || '',
            citations: pub.citations || 0,
            status: 'published'
          }));

          await supabase
            .from('publications')
            .insert(pubsToInsert);
        }

        console.log(`Google Scholar synced for faculty: ${faculty_id}`);

        res.json({
          success: true,
          message: 'Scholar data synced',
          data: {
            h_index,
            total_publications,
            total_citations
          }
        });
      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(500).json({
          success: false,
          message: 'Failed to process Scholar data'
        });
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  syncScholarData
};
