const { sequelize, User, ConsultantProfile, Payout, Service, Appointment } = require('./models');
const bcrypt = require('bcryptjs');

const seedExpert = async () => {
    try {
        // Re-create Expert-related tables to ensure schema matches the model exactly
        console.log('Synchronizing Expert tables...');
        await ConsultantProfile.sync({ force: true });
        await Payout.sync({ force: true });
        await Appointment.sync({ alter: true }); // Appointments might need the documentPath column if missing

        await sequelize.sync();

        // 1. Create Expert User
        const hashedPassword = await bcrypt.hash('expert123', 10);
        const [expertUser, created] = await User.findOrCreate({
            where: { email: 'expert@apex.com' },
            defaults: {
                name: 'Dr. Sarah Wilson',
                password: hashedPassword,
                role: 'expert'
            }
        });

        if (created) console.log('Expert user created.');

        // 2. Create Consultant Profile
        const [profile, profileCreated] = await ConsultantProfile.findOrCreate({
            where: { userId: expertUser.id },
            defaults: {
                bio: 'Senior Academic Advisor with 15+ years experience in Ivy League admissions.',
                expertise: ['Scholarship', 'Visa', 'Ivy League'],
                title: 'Senior Academic Advisor',
                averageRating: 4.9,
                reviewCount: 128,
                availability: {
                    "Monday": ["09:00", "17:00"],
                    "Wednesday": ["10:00", "18:00"],
                    "Friday": ["09:00", "15:00"]
                }
            }
        });

        if (profileCreated) console.log('Expert profile created.');

        // 3. Create dummy service
        const [service] = await Service.findOrCreate({
            where: { title: 'Strategy session' },
            defaults: {
                description: 'PhD Strategy',
                price: 150.00,
                duration: 60
            }
        });

        // 4. Create dummy appointment to link payouts
        const [appointment] = await Appointment.findOrCreate({
            where: { id: 1 },
            defaults: {
                userId: expertUser.id,
                consultantId: profile.id,
                serviceId: service.id,
                date: '2026-02-21',
                time: '14:00',
                status: 'completed'
            }
        });

        // 5. Create some Payouts for the chart
        const months = [1, 2, 3, 4, 5]; // Jan to May
        for (const m of months) {
            const date = new Date();
            date.setMonth(m - 1);

            await Payout.create({
                appointmentId: appointment.id,
                consultantId: profile.id,
                totalAmount: 150,
                consultantShare: 105, // 70%
                platformShare: 45,
                status: 'paid',
                createdAt: date
            });
        }

        // 5. Add a pending payout
        await Payout.create({
            appointmentId: 1,
            consultantId: profile.id,
            totalAmount: 200,
            consultantShare: 140,
            platformShare: 60,
            status: 'pending'
        });

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedExpert();
