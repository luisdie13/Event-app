import bcrypt from 'bcrypt';

const generateHashes = async () => {
    const adminHash = await bcrypt.hash('admin123', 10);
    const memberHash = await bcrypt.hash('member123', 10);
    
    console.log('Admin password hash (admin123):');
    console.log(adminHash);
    console.log('\nMember password hash (member123):');
    console.log(memberHash);
    
    console.log('\n\nSQL Update Commands:');
    console.log(`UPDATE users SET password_hash = '${adminHash}' WHERE email = 'admin@eventplatform.com';`);
    console.log(`UPDATE users SET password_hash = '${memberHash}' WHERE email = 'user@eventplatform.com';`);
};

generateHashes();
