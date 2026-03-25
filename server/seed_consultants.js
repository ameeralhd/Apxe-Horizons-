const { sequelize, User, ConsultantProfile } = require('./models');
const bcrypt = require('bcryptjs');

async function seedConsultants() {
    try {
        await sequelize.sync(); // Ensure tables exist

        const password = await bcrypt.hash('consultant123', 10);

        const consultantsData = [
            {
                name: 'Dr. Sarah Jennings',
                email: 'sarah.j@apexhorizons.com',
                password,
                role: 'consultant',
                profile: {
                    title: 'Senior Scholarship Strategist',
                    bio: 'Former Ivy League admissions officer with 15+ years of experience in securing full-ride scholarships for international students.',
                    expertise: ['Scholarship', 'Admissions', 'Essay Writing'],
                    hourly_rate: 150,
                    rating: 4.9,
                    reviewCount: 124,
                    isOnline: true,
                    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
                }
            },
            {
                name: 'Mark Thompson',
                email: 'mark.t@apexhorizons.com',
                password,
                role: 'consultant',
                profile: {
                    title: 'Visa & Immigration Specialist',
                    bio: 'Certified immigration consultant specializing in student visas for the UK, USA, and Canada. 99% success rate.',
                    expertise: ['Visa', 'Compliance', 'Relocation'],
                    hourly_rate: 120,
                    rating: 4.8,
                    reviewCount: 89,
                    isOnline: false,
                    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
                }
            },
            {
                name: 'Elena Rodriguez',
                email: 'elena.r@apexhorizons.com',
                password,
                role: 'consultant',
                profile: {
                    title: 'Admissions Coach & Career Mentor',
                    bio: 'Helping students bridge the gap between education and career. Specialist in European University admissions.',
                    expertise: ['Admissions', 'Career Coaching', 'CV Review'],
                    hourly_rate: 100,
                    rating: 5.0,
                    reviewCount: 56,
                    isOnline: true,
                    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
            },
            {
                name: 'Ahmed Al-Farsi',
                email: 'ahmed.a@apexhorizons.com',
                password,
                role: 'consultant',
                profile: {
                    title: 'Middle East Academic Advisor',
                    bio: 'Expert in Middle Eastern scholarship programs and international placements for GCC students.',
                    expertise: ['Scholarship', 'Middle East Specialist', 'Admissions'],
                    hourly_rate: 130,
                    rating: 4.7,
                    reviewCount: 42,
                    isOnline: true,
                    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                }
            },
            {
                name: 'Chen Wei',
                email: 'chen.w@apexhorizons.com',
                password,
                role: 'consultant',
                profile: {
                    title: 'Asia-Pacific Admissions Lead',
                    bio: 'Specializing in Chinese and Southeast Asian university applications and scholarship opportunities.',
                    expertise: ['Admissions', 'Asia-Pacific', 'Scholarship'],
                    hourly_rate: 110,
                    rating: 4.9,
                    reviewCount: 67,
                    isOnline: false,
                    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
                }
            }
        ];

        for (const data of consultantsData) {
            const [user, created] = await User.findOrCreate({
                where: { email: data.email },
                defaults: {
                    name: data.name,
                    password: data.password,
                    role: data.role
                }
            });

            if (created || user) {
                await ConsultantProfile.findOrCreate({
                    where: { userId: user.id },
                    defaults: {
                        userId: user.id,
                        ...data.profile
                    }
                });
            }
        }

        console.log('Consultants seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding consultants:', error);
        process.exit(1);
    }
}

seedConsultants();
