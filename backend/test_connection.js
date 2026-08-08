// Native fetch used

async function testPipeline() {
  console.log("1. Testing Session Creation...");
  const sessionRes = await fetch('http://localhost:5000/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient: { id: 'PXT-TEST', name: 'Test User', age: 30, allergies: 'None', chronicIllness: 'None' },
      language: 'English'
    })
  });
  
  if (!sessionRes.ok) {
    console.error("Session creation failed", await sessionRes.text());
    return;
  }
  
  const sessionData = await sessionRes.json();
  console.log("✅ Session created:", sessionData.sessionId);

  console.log("\n2. Testing AI Pipeline (Gemini + Supabase)...");
  const pipelineRes = await fetch('http://localhost:5000/api/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionData.sessionId,
      patient: { id: 'PXT-TEST', name: 'Test User', age: 30, allergies: 'None', chronicIllness: 'None' },
      vitals: {
        heartRate: 85,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        oxygenSaturation: 98,
        temperature: 99.1,
        ecgPattern: 'Normal'
      },
      symptoms: 'Patient complains of a mild headache and sore throat for 2 days.'
    })
  });

  if (!pipelineRes.ok) {
    console.error("Pipeline failed", await pipelineRes.text());
    return;
  }

  const pipelineData = await pipelineRes.json();
  console.log("✅ Pipeline completed successfully!");
  console.log("Diagnosed:", pipelineData.prediction.diagnosis);
  console.log("Prescribed:", pipelineData.proposedRx.prescription);
  console.log("Safety Status:", pipelineData.safety.status);
  
  console.log("\nAll Backend connections (Express, Gemini LLM, Supabase) are working!");
}

testPipeline().catch(console.error);
