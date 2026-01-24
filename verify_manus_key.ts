import 'dotenv/config';
import manusService from './services/manusService';

async function verifyConnection() {
    console.log('Verifying Manus AI Connection (Final Attempt)...');
    console.log('URL:', process.env.MANUS_API_URL);

    if (!process.env.MANUS_API_KEY) {
        console.error('❌ MANUS_API_KEY not found');
        process.exit(1);
    }

    try {
        // Create request
        const req = await manusService.requestResearch('AAPL', 1, 'comprehensive');
        console.log('Request created ID:', req.id);

        // Poll
        for (let i = 0; i < 5; i++) {
            const status = await manusService.getRequestStatus(req.id);
            console.log(`Attempt ${i + 1}: ${status?.status}`);

            if (status?.status === 'completed') {
                console.log('✅ Success!');
                return;
            }
            if (status?.status === 'failed') {
                console.error('❌ Failed:', status.errorMessage);
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        console.log('Timed out (but might still be processing if no explicit error)');
    } catch (error) {
        console.error('❌ Verification Error:', error);
    }
}

verifyConnection();
