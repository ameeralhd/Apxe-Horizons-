// using global fetch (Node 18+)

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/documents/requirements?category=scholarship&type=Undergraduate');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
