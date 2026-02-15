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

const createPublication = async (req, res) => {
  try {
    const { faculty_id, paper_title, journal_name, year, doi_link, citations } = req.body;

    console.log('📝 Creating publication');
    console.log(`   Faculty ID: ${faculty_id}`);
    console.log(`   Paper Title: ${paper_title}`);
    console.log(`   Journal: ${journal_name}`);

    if (!faculty_id || !paper_title || !journal_name || !year) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID, paper title, journal name, and year are required',
      });
    }

    const user_id = await getUserIdByFacultyId(faculty_id);
    if (!user_id) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    const { data: publication, error } = await supabase
      .from('publications')
      .insert({
        user_id,
        title: paper_title,
        journal_conference: journal_name,
        year: parseInt(year, 10),
        doi_link: doi_link || '',
        citations: citations || 0,
        status: 'published',
      })
      .select('id, created_at, updated_at')
      .single();

    if (error) {
      console.error('❌ Publication creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create publication',
        error: error.message,
      });
    }

    const publicationData = {
      id: publication.id,
      faculty_id,
      paper_title,
      journal_name,
      year: String(year),
      doi_link: doi_link || null,
      citations: citations || 0,
      status: 'published',
      created_at: publication.created_at,
      updated_at: publication.updated_at,
    };

    console.log('✅ Publication created successfully');
    console.log(`   Publication ID: ${publication.id}`);

    res.status(201).json({
      success: true,
      message: 'Publication created successfully',
      data: publicationData,
    });
  } catch (error) {
    console.error('❌ Error creating publication:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create publication',
      error: error.message,
    });
  }
};

const getPublicationsByFaculty = async (req, res) => {
  try {
    const { faculty_id } = req.params;

    console.log('🔍 Fetching publications for faculty');
    console.log(`   Faculty ID: ${faculty_id}`);

    const user_id = await getUserIdByFacultyId(faculty_id);
    if (!user_id) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    const { data: publications, error } = await supabase
      .from('publications')
      .select('*')
      .eq('user_id', user_id)
      .order('year', { ascending: false });

    if (error) throw error;

    const mapped = (publications || []).map((p) => ({
      id: p.id,
      faculty_id,
      paper_title: p.title,
      journal_name: p.journal_conference,
      year: String(p.year),
      doi_link: p.doi_link || null,
      citations: p.citations || 0,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    console.log('✅ Publications fetched successfully');
    console.log(`   Count: ${mapped.length}`);

    res.status(200).json({
      success: true,
      message: publications?.length ? 'Publications fetched successfully' : 'No publications found',
      data: mapped,
    });
  } catch (error) {
    console.error('❌ Error fetching publications:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch publications',
      error: error.message,
    });
  }
};

module.exports = { createPublication, getPublicationsByFaculty };
