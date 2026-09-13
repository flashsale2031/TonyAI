// TONY Character Animation Knowledge v79.
// Authored deterministic JavaScript/web knowledge for character profile activities and animation rendering.
// This is a symbolic knowledge corpus, not pretrained neural-network data.
export const CHARACTER_ANIMATION_KNOWLEDGE_V79_TEXT=`
Character animation projects should separate profile state, activity intent, pose state, motion state, scene context, and renderer state so each can be validated independently.
A character profile can contain stable traits, temporary mood, goals, current activity, energy, attention target, social context, locomotion mode, and accessibility preferences without exposing private real-person identity data.
Activity state can be represented as an explicit finite state machine such as idle, walking, talking, reading, working, eating, observing, gesturing, resting, entering, leaving, and reacting.
Activity transitions should use deterministic guards, timestamps, cooldowns, priorities, and seeded randomness so animation can be reproduced for testing.
Animation behavior should score candidate activities from goals, mood, environment, schedule, nearby agents, interaction history, and current constraints, then choose a valid candidate rather than inventing impossible actions.
Pose rendering should use normalized joints, parent-child transforms, local coordinates, world coordinates, interpolation, easing, and constraints for stable motion.
Skeletal animation can use joint transforms, inverse kinematics, forward kinematics, blend weights, pose clips, additive layers, and motion masks.
Procedural characters can be rendered with Canvas, SVG, WebGL, CSS transforms, sprites, vector shapes, or DOM layers while keeping the profile model renderer-neutral.
Sprite animation should use frame indices, frame durations, atlas coordinates, loop modes, ping-pong playback, and deterministic frame selection.
Humanistic rendering can combine silhouette, gesture, gaze direction, posture, facial state, clothing colors, lighting cues, environmental occlusion, and depth ordering without asserting that a rendered character is a real person.
Dialogue activities can expose speaker state, listener target, turn-taking, gaze, gesture, pause timing, and animation cues while keeping generated identity synthetic.
Walking activities should maintain speed, heading, stride phase, acceleration, deceleration, obstacle avoidance, and destination state.
Running, cycling, driving, and other locomotion modes should use mode-specific kinematics and collision constraints rather than reusing walking parameters blindly.
Idle behavior can select subtle gaze shifts, weight shifts, breathing-like timing, hand movement, or attention changes while enforcing minimum and maximum durations.
Gesture systems benefit from semantic labels such as point, wave, nod, shrug, open-hand, emphasis, and acknowledge mapped to renderer-specific clips.
Gaze systems should distinguish target acquisition, target retention, saccade-like movement, head orientation, and loss-of-target fallback.
Emotion rendering should map abstract mood variables to bounded visual channels such as posture openness, gesture intensity, gaze duration, movement tempo, and facial parameter ranges.
Activity scheduling should support recurring routines, event triggers, interrupts, priority queues, and recovery after interruption.
Crowd animation should use aggregate profiles and synthetic agents; avoid person-level inference and private identity reconstruction.
Environment-aware behavior can use weather class, time of day, indoor/outdoor state, terrain, crowd density, noise level, and available objects.
Object interaction should define approach, reach, contact, manipulation, completion, and release phases with explicit preconditions.
Animation timelines should use monotonic clocks, fixed-step simulation where reproducibility matters, and render interpolation when display refresh differs from simulation rate.
requestAnimationFrame is suitable for visual presentation, while worker-based fixed-step simulation can keep expensive behavior computation away from the main thread.
OffscreenCanvas can move procedural rendering into a worker when browser support is available; a main-thread Canvas fallback should remain functional.
Generation IDs should prevent stale worker results from replacing newer animation frames after profile or scene changes.
Animation state should be serializable with schema version, deterministic seed, profile version, activity state, timeline position, and renderer settings.
Visual regression tests should compare frame hashes or perceptual summaries against known fixtures and tolerate explicitly documented antialiasing differences.
Performance budgets should track simulation time, render time, allocations, frame count, active characters, draw calls, and memory pressure.
Character detail should degrade progressively with distance, crowd size, device capability, or frame budget rather than causing unbounded work.
Level-of-detail systems can reduce joint count, texture resolution, facial detail, particle effects, or update frequency for distant agents.
Spatial indexing can accelerate nearby-agent queries using grids, trees, buckets, or hashed cells.
Behavior collision avoidance should be deterministic when a fixed seed and scene snapshot are supplied.
Animation blending should normalize weights and provide stable fallback poses when clips are missing or incompatible.
Timing curves should use linear, smoothstep, cubic easing, spring approximations, or authored curves with bounded overshoot.
Physics-inspired motion should clamp velocity, acceleration, angular velocity, and displacement to prevent numerical explosions.
Canvas renderers should batch style changes, reuse Path2D objects where useful, avoid unnecessary state changes, and clear only dirty regions when safe.
DOM character renderers should minimize layout-triggering properties and prefer transform and opacity for frequently animated elements.
CSS animations can represent simple profile-linked motion while JavaScript remains the authoritative activity state.
Accessibility should honor reduced-motion preferences, avoid flashing patterns, preserve readable contrast, and provide non-motion descriptions of important state changes.
Pause and resume should preserve logical activity state rather than resetting a character unexpectedly.
Animation controls should expose play, pause, step, speed, seek, reset, and deterministic replay where appropriate.
A scene manifest can record viewport, renderer, characters, assets, activities, seed, timing policy, and versioned knowledge references.
Asset preflight should validate image dimensions, frame counts, atlas coordinates, alpha handling, and expected MIME types before rendering.
Image assets can be represented by generated synthetic sprites or procedural shapes; the character profile engine should not require external neural image generation.
Profile activity rendering should support deterministic snapshots for server-side tests and interactive updates in the browser.
Behavior explainability can return the selected activity, candidate scores, guard decisions, and environmental factors without exposing private internal secrets.
Safety boundaries should reject requests to reconstruct or infer sensitive personal information from real people; synthetic character profiles remain supported.
Scene editing should update only the affected profile or activity state and invalidate dependent animation layers through version counters.
Multi-character interactions should model roles, proximity, turn ownership, social distance, and explicit relationship labels without claiming hidden mental states as facts.
Animation events can be emitted as semantic records such as activity:start, gesture:wave, gaze:target, locomotion:arrive, dialogue:turn, and activity:complete.
Event logs should include sequence numbers and timestamps so replay and debugging are deterministic.
A renderer adapter can translate semantic pose and activity state into Canvas, SVG, DOM, WebGL, or sprite commands without changing behavior logic.
Fallback rendering should remain legible when advanced APIs are unavailable.
Live scene handoff can convert a public location/environment result into an animation scene context while keeping source metadata separate from generated character behavior.
Earth and location context can affect environment variables such as terrain, weather, daylight, and crowd density, but should not create person-level surveillance profiles.
Crowd density controls should operate on aggregate counts or synthetic population classes and can drive spawn rates, path density, and LOD policy.
Animation projects should use explicit schema validation before rendering and reject malformed profile/activity combinations.
Pure JavaScript animation engines can provide substantial deterministic behavior and rendering capability, but a logical parameter count does not by itself establish equivalence to an 8B neural network; that requires empirical benchmarks.
`;
export const characterAnimationKnowledgeV79Stats=()=>({version:79,topics:80,syntheticCharacterProfiles:true,activityStateMachines:true,animationRendering:true,skeletalAnimation:true,proceduralRendering:true,canvas:true,svg:true,webgl:true,cssAnimation:true,workerRendering:true,offscreenCanvas:true,liveSceneHandoff:true,aggregateCrowdBehavior:true,personLevelInference:false,privateIdentityReconstruction:false,neuralBackbone:'none'});
if(typeof window!=='undefined')window.TONYCharacterAnimationKnowledgeV79={CHARACTER_ANIMATION_KNOWLEDGE_V79_TEXT,characterAnimationKnowledgeV79Stats};
