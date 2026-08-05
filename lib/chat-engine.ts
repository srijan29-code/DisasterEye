// Emergency chatbot knowledge base
// In production, this would proxy to Gemini API via an edge function.
// For now, provides structured emergency responses with keyword matching.

export type ChatResponse = {
  content: string;
  category: string;
};

const knowledgeBase: { keywords: string[]; category: string; response: string }[] = [
  {
    keywords: ['flood', 'flooding', 'drown', 'water rising'],
    category: 'Flood Safety',
    response: `**Flood Emergency Safety Guide**

**Immediate Actions:**
1. Move to higher ground immediately — do not wait for instructions
2. Avoid walking or driving through flood waters. Just 6 inches of moving water can knock you down, and 2 feet can sweep away a vehicle
3. Turn off utilities at the main switches if you can do so safely

**If Trapped:**
• Move to the highest accessible floor or roof
• Signal for help with bright cloth or a flashlight
• Do not climb into a closed attic — you may become trapped by rising water

**After the Flood:**
• Wait for authorities to declare it safe before returning home
• Avoid flood water — it may be contaminated with sewage and chemicals
• Do not drink tap water until officials confirm it is safe
• Document damage for insurance claims with photographs

**Emergency Contacts:** Call your local disaster management helpline or 911/112/100 for immediate rescue.`,
  },
  {
    keywords: ['fire', 'burning', 'smoke', 'flames', 'wildfire'],
    category: 'Fire Safety',
    response: `**Fire Emergency Safety Guide**

**Immediate Actions:**
1. Call emergency services immediately
2. If the fire is small and contained, use a fire extinguisher (PASS: Pull, Aim, Squeeze, Sweep)
3. If the fire is spreading, evacuate immediately — do not stop for belongings

**Evacuation:**
• Stay low to the ground — smoke rises and is more dangerous than flames
• Feel doors with the back of your hand before opening — if hot, use another exit
• Close doors behind you to slow fire spread
• Once out, stay out — never re-enter a burning building

**If Trapped:**
• Stay in a room with a window, close the door, and seal gaps with cloth
• Signal from the window for firefighters
• Breathe through a wet cloth to filter smoke

**Wildfire Specific:**
• Clear defensible space around your property
• Pack an emergency go-bag with documents, medications, and supplies
• Follow evacuation orders immediately — wildfires move fast

**Emergency Contacts:** Call 911/112/101 for fire department immediately.`,
  },
  {
    keywords: ['earthquake', 'tremor', 'seismic', 'quake'],
    category: 'Earthquake Safety',
    response: `**Earthquake Safety Guide**

**During the Earthquake — Drop, Cover, Hold On:**
1. DROP to hands and knees immediately
2. COVER your head and neck under a sturdy table or desk; if none available, cover with your arms against an interior wall
3. HOLD ON to your shelter until shaking stops

**Do NOT:**
• Run outside during shaking — falling debris is the #1 killer
• Stand in doorways — this is outdated advice; doorways are no stronger than other parts of the house
• Use elevators — you can be trapped if power fails

**After Shaking Stops:**
• Check yourself and others for injuries — administer first aid
• Check for gas leaks — if you smell gas, shut off the main and leave
• Expect aftershocks — they can be nearly as strong as the main quake
• Use text messages, not calls, to communicate — reduces network congestion
• Open cabinets carefully — contents may have shifted

**If Trapped Under Debris:**
• Stay calm — do not kick up dust
• Cover your mouth with cloth
• Tap on pipes or walls so rescuers can hear you — shout only as last resort
• Do not light a match — there may be gas leaks

**Emergency Contacts:** Call 911/112/100 for rescue, or local disaster helpline.`,
  },
  {
    keywords: ['cpr', 'cardiac', 'heart stopped', 'not breathing', 'resuscitation'],
    category: 'CPR Instructions',
    response: `**CPR (Cardiopulmonary Resuscitation) Guide**

**Before Starting CPR:**
1. Check responsiveness — tap shoulders and shout "Are you okay?"
2. Check for breathing for no more than 10 seconds
3. If no breathing (or only gasping), call emergency services and begin CPR

**Chest Compressions:**
1. Place the person on their back on a firm, flat surface
2. Place the heel of one hand in the center of the chest (lower half of sternum)
3. Place your other hand on top, interlocking fingers
4. Position shoulders directly over hands, keep arms straight
5. Push HARD and FAST — at least 2 inches deep, 100-120 compressions per minute
6. Allow the chest to fully recoil between compressions
7. Count: "One and two and three and..." to maintain rhythm

**Rescue Breaths (if trained):**
• After 30 compressions, give 2 breaths
• Tilt head back, lift chin, pinch nose
• Give 1-second breath — watch for chest rise
• Continue 30:2 cycle until help arrives

**If Untrained in Breaths:**
• Perform Hands-Only CPR — continuous chest compressions at 100-120/min
• Do not stop until: help arrives, an AED is available, or the person shows signs of life

**Emergency Contacts:** Call 911/112/102/108 for ambulance immediately.`,
  },
  {
    keywords: ['shelter', 'safe place', 'where to go', 'refuge', 'evacuate', 'evacuation'],
    category: 'Shelter & Evacuation',
    response: `**Shelter and Evacuation Information**

**Finding Nearest Shelter:**
1. Check the Live Map in DisasterEye AI for marked relief camps and shelters
2. Listen to local radio/emergency broadcasts for designated shelter locations
3. Government schools, community halls, and stadiums are often designated shelters

**What to Take (Emergency Go-Bag):**
• Important documents (IDs, insurance, property records) in waterproof bag
• Prescription medications and basic first aid kit
• Drinking water (1 gallon per person per day) and non-perishable food
• Flashlight, batteries, phone charger/power bank
• Cash — ATMs may not work during disasters
• Change of clothes, sturdy shoes, rain gear
• Special items for infants, elderly, or disabled family members

**Evacuation Steps:**
1. Follow official evacuation routes — do not take shortcuts
2. Inform family/friends of your destination
3. Turn off utilities before leaving if time permits
4. Lock your home
5. Help neighbors who may need assistance

**At the Shelter:**
• Register with shelter management on arrival
• Keep your family together and stay informed
• Be patient — resources may be limited
• Volunteer to help if you are able

**Emergency Contacts:** Local disaster management authority or 911/112/100.`,
  },
  {
    keywords: ['emergency contact', 'helpline', 'phone number', 'call', 'hotline'],
    category: 'Emergency Contacts',
    response: `**Emergency Contact Numbers**

**Universal Emergency Numbers:**
• 112 — Universal emergency number (works in many countries)
• 911 — United States and Canada
• 999 — United Kingdom
• 000 — Australia
• 119/110 — Japan

**India-Specific Emergency Numbers:**
• 100 — Police
• 101 — Fire
• 102/108 — Ambulance
• 1070 — State Emergency Operation Centre
• 1077 — District Emergency Operation Centre
• 1900 — NDRF control room

**Disaster Management:**
• National Disaster Helpline: 1078
• NDRF (National Disaster Response Force): 9711077252
• Red Cross: Contact local chapter

**In DisasterEye AI:**
• Use the Report Incident feature to log emergencies for response teams
• Check the Live Map for real-time shelter and relief camp locations
• Enable notifications to receive emergency alerts

Save these numbers in your phone before an emergency occurs.`,
  },
  {
    keywords: ['food safety', 'spoiled food', 'contaminated', 'refrigerator', 'perishable'],
    category: 'Food Safety',
    response: `**Food Safety During and After Disasters**

**Power Outage — Refrigerator/Freezer:**
• Keep refrigerator and freezer doors closed as much as possible
• A full freezer holds its temperature for ~48 hours; half-full for ~24 hours
• Refrigerated food is safe for ~4 hours if the door stays closed
• Discard food above 40°F (4°C) for more than 2 hours

**Flood-Contaminated Food:**
• Discard ALL food that touched flood water — it cannot be safely cleaned
• Discard food in soft packaging (boxes, bags, screw-top jars)
• Canned foods can be saved if: undamaged, labels removed, washed with soap, then sanitized with 1 tablespoon bleach per gallon of water
• Relabel cans with a marker — include expiration date

**Cooking Without Power:**
• Use a charcoal/gas grill OUTDOORS only — never inside
• Use camp stoves outdoors only
• Shelf-stable foods: canned goods, peanut butter, crackers, dried fruit, granola

**Food Preparation Hygiene:**
• Wash hands with soap and safe water before handling food
• Use only safe, clean water for cooking and washing
• Cook food to proper internal temperatures
• If in doubt about food safety, throw it out

**Emergency Contacts:** Local health department for food safety guidance.`,
  },
  {
    keywords: ['water', 'purification', 'clean water', 'drink', 'contaminated water', 'boil'],
    category: 'Water Purification',
    response: `**Water Purification During Emergencies**

**If No Safe Water Is Available:**

**Boiling (Most Effective):**
1. Bring water to a rolling boil for 1 minute (3 minutes at altitudes above 6,500 feet/2,000m)
2. Let it cool before drinking
3. Store in clean, sanitized containers with tight lids
4. This kills all bacteria, viruses, and parasites

**Chlorination (If boiling isn't possible):**
1. Use unscented household liquid bleach (5-9% sodium hypochlorite)
2. Add 8 drops (about 1/8 teaspoon) per gallon of clear water
3. For cloudy water, filter first through clean cloth, then add 16 drops per gallon
4. Mix well, let stand for 30 minutes
5. Water should have a slight chlorine smell — if not, repeat and wait 15 more minutes

**Water Filters:**
• Use NSF-certified filters that remove bacteria and protozoa
• Note: Most standard filters do NOT remove viruses
• Combine filtration with chlorination for complete safety

**Water Sources (in order of safety):**
1. Sealed bottled water (safest)
2. Water from your hot water heater (if properly maintained)
3. Melted ice cubes
4. Water from pipes (after shutting off main to prevent contaminated water entering)
5. Avoid: flood water, swimming pool water, toilet tank water, radiator water

**Storage:**
• Use food-grade containers only
• Clean containers with soap and sanitize before filling
• Store in cool, dark place
• Replace stored water every 6 months

**Signs of Unsafe Water:** Cloudiness, unusual odor, floating particles — do not use.`,
  },
  {
    keywords: ['medical', 'first aid', 'injury', 'wound', 'bleeding', 'medicine'],
    category: 'Medical & First Aid',
    response: `**Medical Emergency & First Aid Guide**

**Severe Bleeding:**
1. Apply direct, firm pressure with a clean cloth or clothing
2. If blood soaks through, add more cloth — do not remove the original
3. Elevate the wound above heart level if possible
4. Apply pressure to the artery if bleeding doesn't stop
5. Call for emergency medical help immediately

**Burns:**
• Minor: Run cool (not cold) water over burn for 10-20 minutes
• Do not apply ice, butter, or ointments to severe burns
• Cover with clean, dry cloth
• Severe burns: seek medical attention immediately — risk of infection and shock

**Fractures:**
• Do not try to realign the bone
• Immobilize the area with a splint (rigid object padded with cloth)
• Apply ice wrapped in cloth to reduce swelling
• Support the injured area above heart level if possible

**Hypothermia:**
• Move person to a warm, dry location
• Remove wet clothing gently
• Cover with blankets, focusing on head and neck
• Give warm (not hot) non-alcoholic beverages if conscious
• Severe hypothermia requires immediate medical care

**Heat Stroke:**
• Move to a cool/shaded area immediately
• Remove excess clothing
• Cool the body with water, wet cloths, or ice packs on neck, armpits, groin
• Do not give fluids if unconscious
• Call emergency services — heat stroke is life-threatening

**Shock:**
• Lay person on their back and elevate legs 12 inches (unless fracture suspected)
• Cover with blanket to maintain body temperature
• Do not give food or water
• Reassure and monitor breathing until help arrives

**Emergency Contacts:** Call 911/112/102/108 for ambulance. Know your nearest hospital.`,
  },
  {
    keywords: ['cyclone', 'hurricane', 'typhoon', 'storm', 'wind'],
    category: 'Cyclone Safety',
    response: `**Cyclone/Hurricane Safety Guide**

**Before the Cyclone:**
1. Secure loose outdoor items — they become dangerous projectiles in high wind
2. Board up windows or install storm shutters
3. Stock up on food, water, medications, and batteries
4. Charge phones and power banks fully
5. Know your nearest shelter and evacuation route

**During the Cyclone:**
• Stay indoors and away from windows
• Move to an interior room, bathroom, or basement
• If flooding begins, move to higher floor — do not use stairs/elevator during peak winds
• Use mattresses or blankets for additional protection from debris
• Do not go outside during the "eye" of the storm — winds will return from the opposite direction

**After the Cyclone:**
• Wait for the official all-clear before going outside
• Treat all downed power lines as live — stay at least 10 meters away
• Avoid driving — roads may be blocked or flooded
• Check on neighbors, especially elderly or disabled
• Use generators outdoors only — carbon monoxide kills

**Evacuation:**
• Follow official evacuation orders immediately
• Take your emergency go-bag
• Inform family of your destination
• Help neighbors who need assistance

**Emergency Contacts:** Local disaster authority, 911/112/100, weather department for updates.`,
  },
  {
    keywords: ['landslide', 'mudslide', 'avalanche', 'slope', 'mudflow'],
    category: 'Landslide Safety',
    response: `**Landslide Safety Guide**

**Warning Signs:**
• New cracks in ground, walls, or pavement
• Doors or windows that stick for the first time
• Water breaking through ground in new locations
• Unusual sounds (rumbling, trees cracking, boulders knocking)
• Tilting trees, fences, or utility poles

**During a Landslide:**
1. Evacuate immediately if you are in the path — move to higher, stable ground
2. If escape is impossible, curl into a tight ball and protect your head
3. Avoid areas below the slide — secondary slides are common

**After a Landslide:**
• Stay away from the slide area — additional slides may occur
• Do not begin cleanup until geological experts assess stability
• Check for injured or trapped people nearby — do not enter debris directly
• Report broken utility lines immediately
• Listen for emergency information on radio

**Evacuation:**
• Move perpendicular to the slide direction if possible
• Follow designated evacuation routes
• Do not return until authorities declare it safe

**Emergency Contacts:** Local disaster authority, 911/112/100, geological survey department.`,
  },
  {
    keywords: ['volunteer', 'help others', 'rescue', 'assist', 'join'],
    category: 'Volunteer Guidance',
    response: `**Volunteer and Rescue Guidance**

**How to Volunteer with DisasterEye AI:**
1. Update your profile role to "Volunteer" in Settings
2. Register in the Volunteers section with your skills and availability
3. Browse nearby rescue tasks and accept those matching your skills
4. Track completed tasks — build your rescue contribution score

**Volunteer Safety First:**
• Never enter a disaster zone without authorization
• Wear appropriate PPE: sturdy boots, gloves, helmet, mask
• Work in teams — never alone in affected areas
• Stay in communication with coordination center
• Know your limits — do not attempt rescues beyond your training

**Key Volunteer Roles:**
• Search and Rescue: Requires specialized training
• Medical First Aid: CPR/AED certified individuals
• Logistics: Distribution of food, water, supplies
• Communications: Radio operators, coordinators
• Damage Assessment: Documenting and reporting
• Crowd Management: Directing people at shelters

**Volunteer Code:**
• Follow instructions from incident commanders
• Do not self-deploy to active disaster zones
• Document your activities for accountability
• Take breaks — fatigue causes accidents

**Register now:** Go to the Volunteers section to join the emergency response network.`,
  },
  {
    keywords: ['hello', 'hi', 'help', 'what can you do', 'start'],
    category: 'General Help',
    response: `**Welcome to DisasterEye AI Emergency Assistant**

I can help you with emergency safety guidance across disaster scenarios:

**What I Can Help With:**
• Flood safety and evacuation procedures
• Fire emergency response and suppression basics
• Earthquake safety — Drop, Cover, Hold On
• Cyclone/hurricane preparedness and shelter
• Landslide warning signs and evacuation
• CPR and first aid instructions
• Finding nearest shelters and relief camps
• Emergency contact numbers
• Food and water safety after disasters
• Medical first aid for injuries
• Volunteer rescue guidance

**How to Use:**
Ask me any question about disaster safety, or use keywords like "flood," "fire," "CPR," "shelter," "water purification," etc.

**For Emergencies:** Always call your local emergency number first (911/112/100). I provide guidance, not live dispatch.

What emergency situation do you need help with?`,
  },
];

export function getChatResponse(userMessage: string): ChatResponse {
  const lower = userMessage.toLowerCase();
  
  let bestMatch: { keywords: string[]; category: string; response: string } | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        const score = keyword.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = entry;
        }
      }
    }
  }

  if (bestMatch) {
    return { content: bestMatch.response, category: bestMatch.category };
  }

  return {
    content: `I understand you're asking about: "${userMessage}". 

I can help with specific disaster emergencies. Try asking about:
• Flood safety
• Fire emergencies
• Earthquake procedures
• Cyclone/hurricane safety
• Landslide warnings
• CPR instructions
• First aid for injuries
• Finding shelters
• Water purification
• Food safety
• Emergency contacts
• Volunteer guidance

For immediate emergencies, call 911/112/100 or your local emergency number.

What specific emergency do you need help with?`,
    category: 'General',
  };
}

export const quickPrompts = [
  'What should I do during a flood?',
  'CPR instructions',
  'Earthquake safety',
  'Nearest shelter information',
  'Emergency contacts',
  'Water purification methods',
  'Food safety after disaster',
  'How to volunteer for rescue?',
];
