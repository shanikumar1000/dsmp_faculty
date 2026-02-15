const { supabase } = require('../lib/supabase');

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

    // Check if employee_id already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', faculty_id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Faculty ID already exists',
      });
    }

    // Create auth user with temporary password
    const tempPassword = `Temp@${Date.now()}`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError);
      return res.status(400).json({
        success: false,
        message: 'Failed to create faculty profile',
        error: authError.message,
      });
    }

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: name,
      email,
      department,
      designation: designation || '',
      employee_id: faculty_id,
      google_scholar_id: scholar_id || null,
      role: 'faculty',
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error('❌ Profile creation error:', profileError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create faculty profile',
        error: profileError.message,
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('employee_id', id)
      .eq('role', 'faculty')
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      console.log('⚠️  Faculty profile not found');
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found',
      });
    }

    const facultyData = {
      faculty_id: profile.employee_id,
      name: profile.full_name,
      department: profile.department,
      email: profile.email,
      scholar_id: profile.google_scholar_id,
      designation: profile.designation,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    console.log('✅ Faculty profile fetched successfully');
    console.log(`   Name: ${profile.full_name}`);

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
