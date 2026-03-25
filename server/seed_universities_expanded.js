const { University } = require('./models');

const universities = [
    // Indonesia
    {
        name: 'University of Indonesia',
        country: 'Indonesia',
        location: 'Depok, Indonesia',
        description: 'The premier center of learning in Indonesia with a global outlook.',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.ui.ac.id',
        category: 'Regional Hub'
    },
    {
        name: 'Gadjah Mada University',
        country: 'Indonesia',
        location: 'Yogyakarta, Indonesia',
        description: 'The oldest and largest institution of higher learning in Indonesia.',
        imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6a29710c?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.ugm.ac.id',
        category: 'Regional Hub'
    },
    {
        name: 'Bandung Institute of Technology',
        country: 'Indonesia',
        location: 'Bandung, Indonesia',
        description: 'Elite technical university producing leaders in engineering and science.',
        imageUrl: 'https://images.unsplash.com/photo-1590012357758-09d30ca78cae?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.itb.ac.id',
        category: 'Regional Hub'
    },
    {
        name: 'IPB University',
        country: 'Indonesia',
        location: 'Bogor, Indonesia',
        description: 'A world-class research university focused on agriculture and biological sciences.',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.ipb.ac.id',
        category: 'Regional Hub'
    },
    {
        name: 'Airlangga University',
        country: 'Indonesia',
        location: 'Surabaya, Indonesia',
        description: 'Pioneer in medical science and one of the most prestigious universities in East Java.',
        imageUrl: 'https://images.unsplash.com/photo-1523050338692-7b835a07973f?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.unair.ac.id',
        category: 'Regional Hub'
    },

    // Malaysia
    {
        name: 'University of Malaya',
        country: 'Malaysia',
        location: 'Kuala Lumpur, Malaysia',
        description: 'The oldest and highest-ranking research university in Malaysia.',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.um.edu.my',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Kebangsaan Malaysia',
        country: 'Malaysia',
        location: 'Bangi, Malaysia',
        description: 'The National University focused on upholding national identity through education.',
        imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.ukm.my',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Putra Malaysia',
        country: 'Malaysia',
        location: 'Serdang, Malaysia',
        description: 'Global leader in agriculture research and high-tech biological solutions.',
        imageUrl: 'https://images.unsplash.com/photo-1621640167576-880998f45a6c?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.upm.edu.my',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Sains Malaysia',
        country: 'Malaysia',
        location: 'Penang, Malaysia',
        description: 'Pioneer university in the APEX program, focused on sustainability.',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.usm.my',
        category: 'Regional Hub'
    },
    {
        name: 'Universiti Teknologi Malaysia',
        country: 'Malaysia',
        location: 'Johor Bahru, Malaysia',
        description: 'Leading innovation-driven research university in engineering and technology.',
        imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.utm.my',
        category: 'Regional Hub'
    },

    // Saudi Arabia
    {
        name: 'King Saud University',
        country: 'Saudi',
        location: 'Riyadh, Saudi Arabia',
        description: 'The first university in the Kingdom, renowned for its excellence in medicine.',
        imageUrl: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://ksu.edu.sa',
        category: 'Regional Hub'
    },
    {
        name: 'King Abdulaziz University',
        country: 'Saudi',
        location: 'Jeddah, Saudi Arabia',
        description: 'Top-ranked university in the Arab world with a strong focus on oceanology.',
        imageUrl: 'https://images.unsplash.com/photo-1576497614313-d317e6f8ecb0?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.kau.edu.sa',
        category: 'Regional Hub'
    },
    {
        name: 'King Fahd University of Petroleum and Minerals',
        country: 'Saudi',
        location: 'Dhahran, Saudi Arabia',
        description: 'Prestigious polytechnic institution focused on energy and engineering.',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.kfupm.edu.sa',
        category: 'Regional Hub'
    },
    {
        name: 'KAUST',
        country: 'Saudi',
        location: 'Thuwal, Saudi Arabia',
        description: 'Graduate-level research university known for its cutting-edge facilities.',
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.kaust.edu.sa',
        category: 'Regional Hub'
    },
    {
        name: 'Princess Nourah bint Abdulrahman University',
        country: 'Saudi',
        location: 'Riyadh, Saudi Arabia',
        description: 'World\'s largest university for women, empowering leaders across todas.',
        imageUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.pnu.edu.sa',
        category: 'Regional Hub'
    },

    // Turkey
    {
        name: 'Istanbul University',
        country: 'Turkey',
        location: 'Istanbul, Turkey',
        description: 'Historical institution bridging the academic heritage of East and West.',
        imageUrl: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.istanbul.edu.tr',
        category: 'Regional Hub'
    },
    {
        name: 'Middle East Technical University',
        country: 'Turkey',
        location: 'Ankara, Turkey',
        description: 'A leading international research university in Ankara.',
        imageUrl: 'https://images.unsplash.com/photo-1565038930214-09566ed2149b?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.metu.edu.tr',
        category: 'Regional Hub'
    },
    {
        name: 'Boğaziçi University',
        country: 'Turkey',
        location: 'Istanbul, Turkey',
        description: 'Premier research university with beautiful views of the Bosphorus strait.',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.boun.edu.tr',
        category: 'Regional Hub'
    },
    {
        name: 'Koç University',
        country: 'Turkey',
        location: 'Istanbul, Turkey',
        description: 'Leading private university dedicated to world-class research and liberal arts.',
        imageUrl: 'https://images.unsplash.com/photo-1594498379393-c35ca32f1fc4?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.ku.edu.tr',
        category: 'Regional Hub'
    },
    {
        name: 'Ankara University',
        country: 'Turkey',
        location: 'Ankara, Turkey',
        description: 'The first higher education institution founded by the Republic of Turkey.',
        imageUrl: 'https://images.unsplash.com/photo-1579427421635-a0015b804b2e?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.ankara.edu.tr',
        category: 'Regional Hub'
    },

    // China
    {
        name: 'Tsinghua University',
        country: 'China',
        location: 'Beijing, China',
        description: 'Top-tier institution known as the "MIT of China" for its tech excellence.',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.tsinghua.edu.cn',
        category: 'Regional Hub'
    },
    {
        name: 'Peking University',
        country: 'China',
        location: 'Beijing, China',
        description: 'Leading research university renowned for its contributions to social sciences.',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.pku.edu.cn',
        category: 'Regional Hub'
    },
    {
        name: 'Fudan University',
        country: 'China',
        location: 'Shanghai, China',
        description: 'Prestigeous Shanghai-based university with a strong international focus.',
        imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.fudan.edu.cn',
        category: 'Regional Hub'
    },
    {
        name: 'Shanghai Jiao Tong University',
        country: 'China',
        location: 'Shanghai, China',
        description: 'One of the oldest and most selective research universities in China.',
        imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.sjtu.edu.cn',
        category: 'Regional Hub'
    },
    {
        name: 'Zhejiang University',
        country: 'China',
        location: 'Hangzhou, China',
        description: 'Dynamic institution known for its scenic campus and engineering innovative.',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        officialLink: 'https://www.zju.edu.cn',
        category: 'Regional Hub'
    }
];

async function seedExpanded() {
    try {
        console.log('Seeding expanded universities...');
        for (const uni of universities) {
            await University.findOrCreate({
                where: { name: uni.name },
                defaults: uni
            });
        }
        console.log('Successfully seeded 25 universities.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding universities:', err);
        process.exit(1);
    }
}

seedExpanded();
