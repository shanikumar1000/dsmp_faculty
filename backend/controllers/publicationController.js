const { db } = require('../firebase/config');

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

    const publicationData = {
      faculty_id,
      paper_title,
      journal_name,
      year,
      doi_link: doi_link || null,
      citations: citations || 0,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const publicationRef = await db.collection('publications').add(publicationData);

    console.log('✅ Publication created successfully');
    console.log(`   Publication ID: ${publicationRef.id}`);

    res.status(201).json({
      success: true,
      message: 'Publication created successfully',
      data: {
        id: publicationRef.id,
        ...publicationData,
      },
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

    const publicationsSnapshot = await db
      .collection('publications')
      .where('faculty_id', '==', faculty_id)
      .orderBy('year', 'desc')
      .get();

    if (publicationsSnapshot.empty) {
      console.log('⚠️  No publications found for this faculty');
      return res.status(200).json({
        success: true,
        message: 'No publications found',
        data: [],
      });
    }

    const publications = [];
    publicationsSnapshot.forEach((doc) => {
      publications.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log('✅ Publications fetched successfully');
    console.log(`   Count: ${publications.length}`);

    res.status(200).json({
      success: true,
      message: 'Publications fetched successfully',
      data: publications,
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
