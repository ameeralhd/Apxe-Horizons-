const { sequelize, Scholarship } = require('./models');

const SCHOLARSHIPS = [
    {
        name: 'Rhodes Scholarship',
        university: 'University of Oxford',
        country: 'UK', flag: '🇬🇧',
        field: 'Any Field',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '£18,180 / year',
        amountNum: 18180,
        deadline: '2026-03-10',
        matchScore: 95,
        link: 'https://www.rhodeshouse.ox.ac.uk',
        logo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=80&q=80',
        description: 'The most prestigious international scholarship programme, covering all fees and living costs at Oxford.'
    },
    {
        name: 'Harvard Merit Scholarship',
        university: 'Harvard University',
        country: 'USA', flag: '🇺🇸',
        field: 'Business',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '$78,000 / year',
        amountNum: 78000,
        deadline: '2026-04-01',
        matchScore: 88,
        link: 'https://www.harvard.edu/scholarships',
        logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=80&q=80',
        description: 'Need-based and merit awards for outstanding students admitted to Harvard graduate programs.'
    },
    {
        name: 'Tsinghua Excellence Award',
        university: 'Tsinghua University',
        country: 'China', flag: '🇨🇳',
        field: 'Engineering',
        level: 'PhD',
        fundingType: 'Full Ride',
        amount: '¥120,000 / year',
        amountNum: 16500,
        deadline: '2026-02-28',
        matchScore: 72,
        link: 'https://www.tsinghua.edu.cn',
        logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=80&q=80',
        description: 'Fully-funded PhD scholarship for international students in STEM disciplines.'
    },
    {
        name: 'UM International Scholarship',
        university: 'Universiti Malaya',
        country: 'Malaysia', flag: '🇲🇾',
        field: 'Any Field',
        level: 'Bachelors',
        fundingType: 'Partial',
        amount: 'RM 12,000 / year',
        amountNum: 2600,
        deadline: '2026-05-15',
        matchScore: 80,
        link: 'https://www.um.edu.my',
        logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=80&q=80',
        description: 'Partial scholarship for top-performing international undergraduates across all faculties.'
    },
    {
        name: 'UI Beasiswa Unggulan',
        university: 'Universitas Indonesia',
        country: 'Indonesia', flag: '🇮🇩',
        field: 'Social Sciences',
        level: 'Bachelors',
        fundingType: 'Tuition Only',
        amount: 'Rp 50,000,000 / year',
        amountNum: 3100,
        deadline: '2026-03-20',
        matchScore: 65,
        link: 'https://www.ui.ac.id',
        logo: 'https://images.unsplash.com/photo-1523050338692-7b835a07973f?auto=format&fit=crop&w=80&q=80',
        description: 'Government-backed tuition scholarship for exemplary Indonesian and international students.'
    },
    {
        name: 'Chevening Scholarship',
        university: 'UK Universities',
        country: 'UK', flag: '🇬🇧',
        field: 'Any Field',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '£28,000 / year',
        amountNum: 28000,
        deadline: '2026-02-26',
        matchScore: 91,
        link: 'https://www.chevening.org',
        logo: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=80&q=80',
        description: 'UK government flagship scholarship covering fees, living allowance, and flights.'
    },
    {
        name: 'Fulbright Program',
        university: 'US Universities',
        country: 'USA', flag: '🇺🇸',
        field: 'Any Field',
        level: 'PhD',
        fundingType: 'Full Ride',
        amount: '$45,000 / year',
        amountNum: 45000,
        deadline: '2026-06-01',
        matchScore: 84,
        link: 'https://foreign.fulbrightonline.org',
        logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=80&q=80',
        description: 'Prestigious US government exchange program for graduate study, research, and teaching.'
    },
    {
        name: 'Chinese Government Scholarship',
        university: 'Peking University',
        country: 'China', flag: '🇨🇳',
        field: 'Engineering',
        level: 'Masters',
        fundingType: 'Full Ride',
        amount: '¥36,000 / year',
        amountNum: 4950,
        deadline: '2026-04-30',
        matchScore: 76,
        link: 'https://www.campuschina.org',
        logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=80&q=80',
        description: 'Funded by the Chinese Ministry of Education for outstanding international graduate students.'
    },
    {
        name: 'UM Presidential Award',
        university: 'Universiti Malaya',
        country: 'Malaysia', flag: '🇲🇾',
        field: 'Technology',
        level: 'PhD',
        fundingType: 'Partial',
        amount: 'RM 24,000 / year',
        amountNum: 5200,
        deadline: '2026-07-01',
        matchScore: 70,
        link: 'https://www.um.edu.my',
        logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=80&q=80',
        description: 'Partial scholarship for PhD candidates in technology and innovation streams.'
    }
];

async function runSeeder() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');
        await sequelize.sync();
        console.log('Database synced.');

        const count = await Scholarship.count();
        if (count === 0) {
            console.log('Seeding initial scholarships...');
            await Scholarship.bulkCreate(SCHOLARSHIPS);
            console.log('Scholarships seeded successfully!');
        } else {
            console.log('Scholarships already exist in DB. Skipping seed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding scholarships:', error);
        process.exit(1);
    }
}

runSeeder();
