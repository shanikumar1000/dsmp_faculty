const { db } = require('../firebase/config');

const createFaculty = async (req, res) => {
  try {
    const { faculty_id, name, department, email, scholar_id, designation } = req.body;

    console.log('📝 Creating faculty profile');
    console.log(`   Name: ${name}`);
    console.log(`   Department: ${department}`);
    console.log(`   Email: ${email}`);

    if (!faculty_id || !name || !department || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID, name, department, and email are required',
      });
    }

    const facultyData = {
      faculty_id,
      name,
      department,
      email,
      scholar_id: scholar_id || null,
      designation: designation || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.collection('faculty').doc(faculty_id).set(facultyData);

    console.log('✅ Faculty profile created successfully');
    console.log(`   Faculty ID: ${faculty_id}`);

    res.status(201).json({
      success: true,
      message: 'Faculty profile created successfully',
      data: facultyData,
    });
  } catch (error) {
    console.error('❌ Error creating faculty profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create faculty profile',
      error: error.message,
    });
  }
};

const getFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching faculty profile');
    console.log(`   Faculty ID: ${id}`);

    const facultyDoc = await db.collection('faculty').doc(id).get();

    if (!facultyDoc.exists) {
      console.log('⚠️  Faculty profile not found');
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found',
      });
    }

    const facultyData = facultyDoc.data();

    console.log('✅ Faculty profile fetched successfully');
    console.log(`   Name: ${facultyData.name}`);

    res.status(200).json({
      success: true,
      message: 'Faculty profile fetched successfully',
      data: facultyData,
    });
  } catch (error) {
    console.error('❌ Error fetching faculty profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty profile',
      error: error.message,
    });
  }
};

module.exports = { createFaculty, getFaculty };
