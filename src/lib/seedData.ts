import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const seedDatabase = async () => {
  try {
    // 1. Seed Agencies
    const states = ['Anambra', 'Lagos', 'Abuja', 'Kano', 'Rivers', 'Delta', 'Enugu', 'Kaduna', 'Oyo', 'Borno'];
    const agencyTypes = [
      { type: 'SEMA', nameSuffix: 'SEMA', desc: 'State Emergency Management Agency' },
      { type: 'Fire', nameSuffix: 'State Fire Service', desc: 'Fire response and prevention' },
      { type: 'NSCDC', nameSuffix: 'NSCDC Command', desc: 'Civil defense and infrastructure protection' },
      { type: 'Hospital', nameSuffix: 'State Teaching Hospital', desc: 'Tertiary medical care and emergency' },
      { type: 'Police', nameSuffix: 'Police Command', desc: 'Law enforcement and security' },
      { type: 'FRSC', nameSuffix: 'Sector Command', desc: 'Road safety and traffic management' },
      { type: 'NEMA', nameSuffix: 'NEMA Zone', desc: 'National Emergency Management Agency' },
      { type: 'NEMSAS', nameSuffix: 'NEMSAS', desc: 'National Emergency Medical Service and Ambulance System' },
    ];

    const agencies = [];

    // Add Federal Fire Service
    const fedFireRef = await addDoc(collection(db, 'agencies'), {
      name: 'Federal Fire Service',
      type: 'Fire',
      state: 'GLOBAL',
      primary_phone: '08032000000',
      description: 'National fire response agency'
    });
    console.log(`Federal Fire Service created with ID: ${fedFireRef.id}`);

    for (const state of states) {
      for (const agencyType of agencyTypes) {
        agencies.push({
          name: `${state} ${agencyType.nameSuffix}`,
          type: agencyType.type,
          state: state,
          primary_phone: `0803${Math.floor(Math.random() * 9000000) + 1000000}`,
          description: agencyType.desc
        });
      }
    }

    for (const agency of agencies) {
      const docRef = await addDoc(collection(db, 'agencies'), agency);
      console.log(`Agency created: ${agency.name} with ID: ${docRef.id}`);
    }

    // 2. Seed Content Modules
    const languages = [
      { code: 'English', label: 'English' },
      { code: 'Igbo', label: 'Igbo' },
      { code: 'Hausa', label: 'Hausa' },
      { code: 'Yoruba', label: 'Yoruba' },
      { code: 'French', label: 'French' },
      { code: 'Mandarin', label: 'Mandarin' },
      { code: 'German', label: 'German' },
      { code: 'Spanish', label: 'Spanish' },
      { code: 'Italian', label: 'Italian' },
      { code: 'Arabic', label: 'Arabic' },
      { code: 'Hindi', label: 'Hindi' }
    ];

    const moduleTemplates = [
      { title: 'Fire safety at home', category: 'Fire', summary: 'Preventing domestic fires.' },
      { title: 'Flooding and erosion basics', category: 'Flood', summary: 'Understanding flood risks.' },
      { title: 'Your emergency medical rights', category: 'Medical', summary: 'Knowing your rights during medical emergencies.' }
    ];

    for (const lang of languages) {
      for (const temp of moduleTemplates) {
        const mod = {
          title: `${temp.title} (${lang.label})`,
          category: temp.category,
          state: 'GLOBAL',
          language: lang.code,
          summary: `${temp.summary} Available in ${lang.label}.`
        };
        const modRef = await addDoc(collection(db, 'contentModules'), mod);
        
        for (let i = 1; i <= 3; i++) {
          await addDoc(collection(db, 'lessons'), {
            module_id: modRef.id,
            title: `Lesson ${i}: ${temp.title} (${lang.label})`,
            body: `This is a placeholder for lesson ${i} content regarding ${temp.title} in ${lang.label}.`,
            order_index: i
          });
        }
      }
    }

    // 3. Seed Sample Incidents for testing
    const incidentTypes = ['Fire', 'Flood', 'Medical', 'Security', 'Road Crash'];
    const statuses = ['New', 'Acknowledged', 'En route', 'Resolved'];
    
    for (let i = 0; i < 10; i++) {
      const state = states[Math.floor(Math.random() * states.length)];
      const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random coordinates around Nigeria (approx 4.5 to 13.5 N, 3.5 to 14.5 E)
      const lat = 6.5 + (Math.random() * 4);
      const lng = 6.5 + (Math.random() * 4);

      await addDoc(collection(db, 'incidents'), {
        incident_type: type,
        description: `Sample ${type} incident for testing in ${state}.`,
        state: state,
        lga: 'Sample LGA',
        reporter_id: 'seed-user',
        status: status,
        location: {
          latitude: lat,
          longitude: lng
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
