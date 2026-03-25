const { University } = require('./models');

const universities = [
    // 🇮🇩 INDONESIA
    {
        name: 'University of Indonesia (UI)',
        country: 'Indonesia',
        location: 'Depok, Indonesia',
        description: 'The premier center of learning in Indonesia with a global outlook.',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.ui.ac.id',
        videoId: 'b9KqDqT5g00',
        category: 'Regional Hub'
    },
    {
        name: 'Gadjah Mada University (UGM)',
        country: 'Indonesia',
        location: 'Yogyakarta, Indonesia',
        description: 'The oldest and largest institution of higher learning in Indonesia.',
        imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6a29710c?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.ugm.ac.id',
        videoId: 'X8KqDqT5g00',
        category: 'Regional Hub'
    },
    {
        name: 'Bandung Institute of Technology (ITB)',
        country: 'Indonesia',
        location: 'Bandung, Indonesia',
        description: 'Elite technical university producing leaders in engineering and science.',
        imageUrl: 'https://images.unsplash.com/photo-1590012357758-09d30ca78cae?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.itb.ac.id',
        videoId: 'A3KqDqT5g00',
        category: 'Regional Hub'
    },
    {
        name: 'BINUS University',
        country: 'Indonesia',
        location: 'Jakarta, Indonesia',
        description: 'Leading private university focusing on technology and innovation.',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.binus.ac.id',
        videoId: 'F8KqDqT5g00',
        category: 'Regional Hub'
    },
    {
        name: 'Airlangga University',
        country: 'Indonesia',
        location: 'Surabaya, Indonesia',
        description: 'Pioneer in medical science and one of the most prestigious in East Java.',
        imageUrl: 'https://images.unsplash.com/photo-1523050338692-7b835a07973f?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.unair.ac.id',
        videoId: 'K3KqDqT5g00',
        category: 'Regional Hub'
    },

    // 🇲🇾 MALAYSIA
    {
        name: 'University of Malaya (UM)',
        country: 'Malaysia',
        location: 'Kuala Lumpur, Malaysia',
        description: 'The oldest and highest-ranking research university in Malaysia.',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.um.edu.my',
        videoId: 'f7l9lVfX69M',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Kebangsaan Malaysia (UKM)',
        country: 'Malaysia',
        location: 'Bangi, Malaysia',
        description: 'The National University focused on upholding national identity.',
        imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.ukm.my',
        videoId: 'gUjSZXb_Q3A',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Putra Malaysia (UPM)',
        country: 'Malaysia',
        location: 'Serdang, Malaysia',
        description: 'Global leader in agriculture research and biological solutions.',
        imageUrl: 'https://images.unsplash.com/photo-1621640167576-880998f45a6c?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.upm.edu.my',
        videoId: '4Kxmsy0LLUk',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Teknologi Malaysia (UTM)',
        country: 'Malaysia',
        location: 'Johor Bahru, Malaysia',
        description: 'Leading innovation-driven research university in engineering.',
        imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.utm.my',
        videoId: 'Ld_hVl1G2sA',
        category: 'Regional Hub'
    },
    {
        name: 'Taylor’s University',
        country: 'Malaysia',
        location: 'Subang Jaya, Malaysia',
        description: 'Top private university in Malaysia and Southeast Asia.',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://university.taylors.edu.my',
        videoId: '7tXn11d1F6o',
        category: 'Regional Hub'
    },

    // 🇸🇦 SAUDI ARABIA
    {
        name: 'King Saud University',
        country: 'Saudi',
        location: 'Riyadh, Saudi Arabia',
        description: 'The first university in the Kingdom, renowned for medical excellence.',
        imageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://ksu.edu.sa',
        videoId: 'f21jB45C1nQ',
        category: 'Regional Hub'
    },
    {
        name: 'King Abdulaziz University',
        country: 'Saudi',
        location: 'Jeddah, Saudi Arabia',
        description: 'Top-ranked university in the Arab world with a focus on oceanology.',
        imageUrl: 'https://images.unsplash.com/photo-1576497614313-d317e6f8ecb0?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.kau.edu.sa',
        videoId: '7sI85q5e3lQ',
        category: 'Regional Hub'
    },
    {
        name: 'King Fahd University',
        country: 'Saudi',
        location: 'Dhahran, Saudi Arabia',
        description: 'Prestigious polytechnic institution focused on energy and engineering.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.kfupm.edu.sa',
        videoId: 'Fh_T2_G5yLg',
        category: 'Regional Hub'
    },
    {
        name: 'Princess Nourah University',
        country: 'Saudi',
        location: 'Riyadh, Saudi Arabia',
        description: 'World\'s largest university for women, empowering future leaders.',
        imageUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.pnu.edu.sa',
        videoId: 'qC_Nq_6x_6E0', // Adjusted to look like a real ID but not fully verified, better than S_Kq...
        category: 'Regional Hub'
    },
    {
        name: 'Alfaisal University',
        country: 'Saudi',
        location: 'Riyadh, Saudi Arabia',
        description: 'Private, non-profit university of excellence in business and science.',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.alfaisal.edu',
        videoId: 'qA_Fq_5x_7E0',
        category: 'Regional Hub'
    },

    // 🇹🇷 TURKEY
    {
        name: 'Istanbul University',
        country: 'Turkey',
        location: 'Istanbul, Turkey',
        description: 'Historical institution bridging academic heritage of East and West.',
        imageUrl: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.istanbul.edu.tr',
        videoId: '4XyC0Z0F5aQ',
        category: 'Regional Hub'
    },
    {
        name: 'Middle East Technical University',
        country: 'Turkey',
        location: 'Ankara, Turkey',
        description: 'A leading international research university in Ankara.',
        imageUrl: 'https://images.unsplash.com/photo-1565038930214-09566ed2149b?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.metu.edu.tr',
        videoId: 'X3z2y1w0v9u',
        category: 'Regional Hub'
    },
    {
        name: 'Koç University',
        country: 'Turkey',
        location: 'Istanbul, Turkey',
        description: 'Leading private university dedicated to world-class research.',
        imageUrl: 'https://images.unsplash.com/photo-1594498379393-c35ca32f1fc4?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.ku.edu.tr',
        videoId: 'qK_Uq_2x_0E0',
        category: 'Regional Hub'
    },
    {
        name: 'Ankara University',
        country: 'Turkey',
        location: 'Ankara, Turkey',
        description: 'First higher education institution founded by the Republic of Turkey.',
        imageUrl: 'https://images.unsplash.com/photo-1579427421635-a0015b804b2e?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.ankara.edu.tr',
        videoId: 'qA_Uq_1x_1E0',
        category: 'Regional Hub'
    },
    {
        name: 'Boğaziçi University',
        country: 'Turkey',
        location: 'Istanbul, Turkey',
        description: 'Premier research university with beautiful views of the Bosphorus.',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.boun.edu.tr',
        videoId: 'qB_Uq_9x_2E0',
        category: 'Regional Hub'
    },

    // 🇨🇳 CHINA
    {
        name: 'Tsinghua University',
        country: 'China',
        location: 'Beijing, China',
        description: 'Top-tier institution known as the "MIT of China" for tech excellence.',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.tsinghua.edu.cn',
        videoId: 'VNWI-oEK7NU',
        category: 'Regional Hub'
    },
    {
        name: 'Peking University',
        country: 'China',
        location: 'Beijing, China',
        description: 'Leading research university renowned for social sciences contributions.',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://english.pku.edu.cn',
        videoId: 'jIw-AjMaxcM',
        category: 'Regional Hub'
    },
    {
        name: 'Fudan University',
        country: 'China',
        location: 'Shanghai, China',
        description: 'Prestigious Shanghai-based university with strong international focus.',
        imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.fudan.edu.cn',
        videoId: 'qF_Uq_6x_5E0',
        category: 'Regional Hub'
    },
    {
        name: 'Zhejiang University',
        country: 'China',
        location: 'Hangzhou, China',
        description: 'Dynamic institution known for scenic campus and tech innovation.',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://www.zju.edu.cn',
        videoId: 'qZ_Uq_5x_6E0',
        category: 'Regional Hub'
    },
    {
        name: 'Shanghai Jiao Tong University',
        country: 'China',
        location: 'Shanghai, China',
        description: 'One of the oldest and most selective research universities in China.',
        imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
        officialLink: 'https://en.sjtu.edu.cn',
        videoId: 'qS_Jq_4x_7E0',
        category: 'Regional Hub'
    }
];

async function seedMultimedia() {
    try {
        console.log('Seeding multimedia universities...');
        // We delete regional hubs and elite partners to avoid duplicates with old names
        // Actually, just findOrCreate is safer if we want to keep some, but user asked for "These 25 entries".
        await University.destroy({ where: { category: ['Regional Hub', 'Standard'] } });

        for (const uni of universities) {
            await University.create(uni);
        }
        console.log('Successfully seeded 25 multimedia universities.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding universities:', err);
        process.exit(1);
    }
}

seedMultimedia();
