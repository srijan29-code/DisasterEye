// Mock AI disaster analysis engine
// In production, this would call Gemini API / YOLOv11 via an edge function.

export type AnalysisResult = {
  disaster_type: string;
  confidence_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severity_score: number;
  objects_detected: string[];
  buildings_affected: number;
  roads_blocked: number;
  people_visible: number;
  estimated_damage: string;
  rescue_teams_required: number;
  recommendations: string[];
  summary: string;
};

const disasterProfiles: Record<string, {
  objects: string[];
  baseSeverity: number;
  damage: string;
  recommendations: string[];
  summary: string;
}> = {
  flood: {
    objects: ['Water', 'Submerged buildings', 'Flooded roads', 'Debris', 'Vehicles'],
    baseSeverity: 70,
    damage: 'Widespread water damage to residential and commercial structures. Road infrastructure severely compromised. Electrical and water utility disruptions expected.',
    recommendations: [
      'Evacuate low-lying areas immediately and move to higher ground',
      'Avoid walking or driving through flood waters — 6 inches can knock you down',
      'Shut off electricity and gas at main switches before evacuation',
      'Deploy swift-water rescue teams to affected zones',
      'Establish relief camps on elevated terrain with clean water supply',
      'Issue boil-water advisory for all affected municipal water sources',
    ],
    summary: 'Significant flooding detected with submerged infrastructure and compromised road networks. Immediate evacuation of affected populations is critical. Rescue operations should prioritize vulnerable individuals including elderly and children.',
  },
  fire: {
    objects: ['Flames', 'Smoke', 'Burning structures', 'Fire spread', 'Affected vegetation'],
    baseSeverity: 80,
    damage: 'Active structural fire with spreading flame front. Multiple buildings involved. High risk to life and property. Smoke inhalation hazard for surrounding areas.',
    recommendations: [
      'Call emergency services immediately — do not attempt to fight large fires',
      'Evacuate downwind areas due to smoke inhalation risk',
      'Close all doors and windows to slow fire spread if evacuation is impossible',
      'Deploy fire suppression teams and aerial water bombing if available',
      'Establish safe perimeter at minimum 300 meters from active fire',
      'Set up medical triage for smoke inhalation and burn casualties',
    ],
    summary: 'Active fire detected with visible flames and spreading smoke. Immediate evacuation and fire suppression response required. High risk to life and adjacent structures.',
  },
  earthquake: {
    objects: ['Collapsed structures', 'Rubble', 'Cracked roads', 'Displaced vehicles', 'Dust clouds'],
    baseSeverity: 85,
    damage: 'Severe structural damage with multiple building collapses. Road infrastructure cracked and buckled. High probability of trapped individuals under debris.',
    recommendations: [
      'Check for injuries and administer first aid before moving',
      'Avoid damaged buildings — aftershocks can cause further collapse',
      'Use text messaging instead of calls to reduce network congestion',
      'Deploy urban search and rescue teams with heavy equipment',
      'Shut off gas lines to prevent secondary fires',
      'Prepare for aftershocks — drop, cover, and hold on if shaking resumes',
    ],
    summary: 'Major earthquake damage detected with collapsed buildings and compromised infrastructure. Search and rescue operations are the top priority. Aftershock preparedness essential for all responders.',
  },
  cyclone: {
    objects: ['Storm damage', 'Fallen trees', 'Wind debris', 'Damaged roofs', 'Flooding'],
    baseSeverity: 75,
    damage: 'Cyclonic wind damage with uprooted trees, damaged roofing, and associated flooding. Power infrastructure severely disrupted. Flying debris hazard ongoing.',
    recommendations: [
      'Stay indoors until all-clear is issued by authorities',
      'Avoid windows and exterior walls during ongoing winds',
      'Treat all downed power lines as live and dangerous',
      'Deploy debris clearance teams to restore emergency access routes',
      'Assess structural integrity before reoccupying any buildings',
      'Distribute tarpaulins and emergency shelter materials to affected families',
    ],
    summary: 'Cyclone impact detected with wind damage to structures and infrastructure. Ongoing safety hazards from debris and downed utilities. Phased reoccupation after structural assessment recommended.',
  },
  landslide: {
    objects: ['Soil displacement', 'Blocked roads', 'Uprooted trees', 'Rock debris', 'Damaged structures'],
    baseSeverity: 78,
    damage: 'Landslide with significant soil and rock displacement. Road access blocked. Structures at base or path of slide at risk. Secondary slides possible.',
    recommendations: [
      'Evacuate areas below the landslide — secondary slides are common',
      'Do not attempt to clear debris until geological assessment is complete',
      'Monitor for cracks in ground and new water seepage patterns',
      'Deploy geological survey team to assess slope stability',
      'Establish alternate access routes for affected communities',
      'Relocate displaced residents to stable ground relief camps',
    ],
    summary: 'Landslide detected with blocked access routes and structural risk. Geological stability assessment required before any debris clearance or reoccupation. Secondary slide risk remains elevated.',
  },
  building_collapse: {
    objects: ['Collapsed structure', 'Rubble pile', 'Exposed rebar', 'Dust', 'Displaced occupants'],
    baseSeverity: 82,
    damage: 'Building collapse with extensive rubble. High probability of trapped victims. Adjacent structures may have suffered foundation damage. Dust and debris hazard active.',
    recommendations: [
      'Do not enter partially collapsed structures — risk of total collapse',
      'Deploy specialized urban search and rescue with concrete cutting equipment',
      'Establish exclusion zone around adjacent potentially unstable buildings',
      'Coordinate with utility companies to shut off gas, water, and electricity',
      'Set up family unification center at safe distance from collapse site',
      'Deploy canines and acoustic listening devices for victim location',
    ],
    summary: 'Building collapse detected with trapped victim probability high. Specialized USAR deployment required immediately. Adjacent structure integrity assessment critical before widening operations.',
  },
  road_blockage: {
    objects: ['Blocked road', 'Debris pile', 'Stopped vehicles', 'Structural damage', 'Access obstruction'],
    baseSeverity: 50,
    damage: 'Road access blocked by debris or structural failure. Traffic flow disrupted. Emergency vehicle access compromised. Secondary incidents possible from queueing traffic.',
    recommendations: [
      'Establish alternate detour routes and notify traffic management',
      'Deploy debris clearance equipment to restore emergency access',
      'Assess cause of blockage — may indicate underlying structural failure',
      'Position warning signage and barriers to prevent vehicle approach',
      'Coordinate with public transport to reroute affected services',
    ],
    summary: 'Road blockage detected with disrupted traffic and emergency access. Clearance operations should proceed once cause assessment rules out underlying structural instability.',
  },
  other: {
    objects: ['Affected area', 'Damage indicators', 'Civilian presence', 'Infrastructure impact'],
    baseSeverity: 45,
    damage: 'Unspecified disaster impact detected. Ground-level assessment required to determine full scope and appropriate response allocation.',
    recommendations: [
      'Deploy ground assessment team to classify disaster type and scope',
      'Establish communication with local authorities for situational awareness',
      'Prepare flexible response — equipment and personnel requirements TBD',
      'Document scene thoroughly for post-incident analysis and reporting',
    ],
    summary: 'Unspecified disaster impact detected. Ground-level assessment required before committing specific response resources. Maintain readiness for multi-type disaster response.',
  },
};

const disasterTypes = Object.keys(disasterProfiles);

export function analyzeImage(
  imageDataUrl: string,
  description: string,
  category?: string
): AnalysisResult {
  // Deterministic-ish "analysis" based on description keywords + pseudo-randomness
  const lowerDesc = (description || '').toLowerCase();
  
  let detectedType = category || 'other';
  for (const type of disasterTypes) {
    if (lowerDesc.includes(type) || lowerDesc.includes(type.replace('_', ' '))) {
      detectedType = type;
      break;
    }
  }

  const profile = disasterProfiles[detectedType] || disasterProfiles.other;
  
  // Pseudo-random variance seeded by image length for stability
  const seed = imageDataUrl.length + lowerDesc.length;
  const variance = (seed % 20) - 10;
  const confidence = Math.min(98, Math.max(65, 78 + variance));
  const severityScore = Math.min(100, Math.max(15, profile.baseSeverity + variance));
  
  const severity: AnalysisResult['severity'] = 
    severityScore >= 85 ? 'critical' :
    severityScore >= 70 ? 'high' :
    severityScore >= 40 ? 'medium' : 'low';

  const buildingsAffected = Math.max(0, Math.floor(severityScore / 8) + (seed % 7));
  const roadsBlocked = Math.max(0, Math.floor(severityScore / 15) + (seed % 4));
  const peopleVisible = Math.max(0, Math.floor(severityScore / 10) + (seed % 6));
  const rescueTeams = Math.max(1, Math.ceil(severityScore / 20));

  return {
    disaster_type: detectedType,
    confidence_score: confidence,
    severity,
    severity_score: severityScore,
    objects_detected: profile.objects,
    buildings_affected: buildingsAffected,
    roads_blocked: roadsBlocked,
    people_visible: peopleVisible,
    estimated_damage: profile.damage,
    rescue_teams_required: rescueTeams,
    recommendations: profile.recommendations,
    summary: profile.summary,
  };
}
