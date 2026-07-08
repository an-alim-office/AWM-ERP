"use client";


import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";


type GeoPoint = {

lat: number;

lng: number;

};


type LocationState = {

lat: number;

lng: number;

accuracy: number;

altitude: number | null;

altitudeAccuracy: number | null;

heading: number | null;

speed: number | null;

timestamp: number;

};


type AttendancePayload = {

id: string;

type: "CHECK_IN" | "CHECK_OUT";

employeeId: string;

location: LocationState;

office: {

name: string;

lat: number;

lng: number;

radiusMeters: number;

};

distanceMeters: number;

isInsideGeofence: boolean;

device: {

userAgent: string;

platform: string;

language: string;

timezone: string;

};

createdAt: string;

};


type SubmitStatus = "idle" | "submitting" | "success" | "queued" | "error";


const OFFICE_LOCATION = {

name: "Main Office",

lat: 23.810331,

lng: 90.412521,

radiusMeters: 150,

};


const EMPLOYEE_ID = "EMP-001";


const LOCATION_OPTIONS: PositionOptions = {

enableHighAccuracy: true,

timeout: 20000,

maximumAge: 0,

};


const API_ENDPOINT = "/api/attendance/gps";


function toRad(value: number) {

return (value * Math.PI) / 180;

}


function getDistanceMeters(from: GeoPoint, to: GeoPoint) {

const earthRadius = 6371000;


const dLat = toRad(to.lat - from.lat);

const dLng = toRad(to.lng - from.lng);


const lat1 = toRad(from.lat);

const lat2 = toRad(to.lat);


const a =

Math.sin(dLat / 2) * Math.sin(dLat / 2) +

Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);


const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));


return earthRadius * c;

}


function formatDateTime(timestamp: number) {

return new Intl.DateTimeFormat("bn-BD", {

dateStyle: "medium",

timeStyle: "medium",

}).format(new Date(timestamp));

}


function formatMeters(value: number) {

if (!Number.isFinite(value)) return "N/A";

if (value >= 1000) return `${(value / 1000).toFixed(2)} কিমি`;

return `${Math.round(value)} মিটার`;

}


function getGeoErrorMessage(error: GeolocationPositionError) {

switch (error.code) {

case error.PERMISSION_DENIED:

return "লোকেশন পারমিশন বন্ধ আছে। ব্রাউজার সেটিংস থেকে Location permission Allow করুন।";

case error.POSITION_UNAVAILABLE:

return "লোকেশন পাওয়া যাচ্ছে না। GPS/Internet চালু আছে কিনা দেখুন।";

case error.TIMEOUT:

return "লোকেশন নিতে সময় বেশি লাগছে। আবার চেষ্টা করুন।";

default:

return "লোকেশন নেওয়ার সময় সমস্যা হয়েছে।";

}

}


function makeAttendanceId() {

if (typeof crypto !== "undefined" && "randomUUID" in crypto) {

return crypto.randomUUID();

}


return `gps-${Date.now()}-${Math.random().toString(36).slice(2)}`;

}


function getDeviceInfo() {

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";


return {

userAgent: navigator.userAgent,

platform: navigator.platform || "Unknown",

language: navigator.language || "Unknown",

timezone,

};

}


function saveOfflineAttendance(payload: AttendancePayload) {

const key = "pending-gps-attendance";

const existingRaw = localStorage.getItem(key);

const existing: AttendancePayload[] = existingRaw ? JSON.parse(existingRaw) : [];


existing.push(payload);

localStorage.setItem(key, JSON.stringify(existing));

}


export default function GPSAttendancePage() {

const watchIdRef = useRef<number | null>(null);


const [location, setLocation] = useState<LocationState | null>(null);

const [permission, setPermission] = useState<PermissionState | "unsupported" | "checking">(

"checking"

);

const [isWatching, setIsWatching] = useState(false);

const [isLoadingLocation, setIsLoadingLocation] = useState(false);

const [geoError, setGeoError] = useState("");

const [attendanceType, setAttendanceType] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");

const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

const [submitMessage, setSubmitMessage] = useState("");

const [lastSubmitted, setLastSubmitted] = useState<AttendancePayload | null>(null);


const isSecureContextReady =

typeof window !== "undefined" &&

(window.isSecureContext || window.location.hostname === "localhost");


const distanceMeters = useMemo(() => {

if (!location) return null;


return getDistanceMeters(

{

lat: location.lat,

lng: location.lng,

},

{

lat: OFFICE_LOCATION.lat,

lng: OFFICE_LOCATION.lng,

}

);

}, [location]);


const isInsideGeofence = useMemo(() => {

if (distanceMeters === null) return false;

return distanceMeters <= OFFICE_LOCATION.radiusMeters;

}, [distanceMeters]);


const googleMapsLink = useMemo(() => {

if (!location) return "#";

return `https://www.google.com/maps?q=${location.lat},${location.lng}`;

}, [location]);


const officeMapsLink = useMemo(() => {

return `https://www.google.com/maps?q=${OFFICE_LOCATION.lat},${OFFICE_LOCATION.lng}`;

}, []);


const checkPermission = useCallback(async () => {

if (typeof navigator === "undefined") return;


if (!("geolocation" in navigator)) {

setPermission("unsupported");

setGeoError("এই ডিভাইস/ব্রাউজারে Geolocation সাপোর্ট নেই।");

return;

}


if (!("permissions" in navigator)) {

setPermission("unsupported");

return;

}


try {

const status = await navigator.permissions.query({

name: "geolocation" as PermissionName,

});


setPermission(status.state);


status.onchange = () => {

setPermission(status.state);

};

} catch {

setPermission("unsupported");

}

}, []);


const positionToState = useCallback((position: GeolocationPosition): LocationState => {

return {

lat: position.coords.latitude,

lng: position.coords.longitude,

accuracy: position.coords.accuracy,

altitude: position.coords.altitude,

altitudeAccuracy: position.coords.altitudeAccuracy,

heading: position.coords.heading,

speed: position.coords.speed,

timestamp: position.timestamp,

};

}, []);


const getCurrentLocation = useCallback(() => {

setGeoError("");

setSubmitMessage("");


if (typeof navigator === "undefined" || !("geolocation" in navigator)) {

setGeoError("এই ব্রাউজারে GPS/Location সাপোর্ট নেই।");

return;

}


if (!isSecureContextReady) {

setGeoError("GPS ব্যবহার করতে HTTPS প্রয়োজন। Localhost হলে সমস্যা হবে না।");

return;

}


setIsLoadingLocation(true);


navigator.geolocation.getCurrentPosition(

(position) => {

setLocation(positionToState(position));

setIsLoadingLocation(false);

},

(error) => {

setGeoError(getGeoErrorMessage(error));

setIsLoadingLocation(false);

},

LOCATION_OPTIONS

);

}, [isSecureContextReady, positionToState]);


const startLiveTracking = useCallback(() => {

setGeoError("");

setSubmitMessage("");


if (typeof navigator === "undefined" || !("geolocation" in navigator)) {

setGeoError("এই ব্রাউজারে GPS/Location সাপোর্ট নেই।");

return;

}


if (!isSecureContextReady) {

setGeoError("GPS ব্যবহার করতে HTTPS প্রয়োজন। Localhost হলে সমস্যা হবে না।");

return;

}


if (watchIdRef.current !== null) {

navigator.geolocation.clearWatch(watchIdRef.current);

}


setIsWatching(true);


watchIdRef.current = navigator.geolocation.watchPosition(

(position) => {

setLocation(positionToState(position));

setIsLoadingLocation(false);

},

(error) => {

setGeoError(getGeoErrorMessage(error));

setIsWatching(false);


if (watchIdRef.current !== null) {

navigator.geolocation.clearWatch(watchIdRef.current);

watchIdRef.current = null;

}

},

LOCATION_OPTIONS

);

}, [isSecureContextReady, positionToState]);


const stopLiveTracking = useCallback(() => {

if (typeof navigator !== "undefined" && watchIdRef.current !== null) {

navigator.geolocation.clearWatch(watchIdRef.current);

watchIdRef.current = null;

}


setIsWatching(false);

}, []);


const createPayload = useCallback((): AttendancePayload | null => {

if (!location || distanceMeters === null) return null;


return {

id: makeAttendanceId(),

type: attendanceType,

employeeId: EMPLOYEE_ID,

location,

office: OFFICE_LOCATION,

distanceMeters,

isInsideGeofence,

device: getDeviceInfo(),

createdAt: new Date().toISOString(),

};

}, [attendanceType, distanceMeters, isInsideGeofence, location]);


const submitAttendance = useCallback(async () => {

setSubmitMessage("");

setSubmitStatus("idle");


if (!location) {

setGeoError("আগে আপনার বর্তমান লোকেশন নিন।");

return;

}


if (distanceMeters === null) {

setGeoError("দূরত্ব হিসাব করা যায়নি। আবার চেষ্টা করুন।");

return;

}


if (!isInsideGeofence) {

setSubmitStatus("error");

setSubmitMessage(

`আপনি অফিস জোনের বাইরে আছেন। বর্তমান দূরত্ব ${formatMeters(

distanceMeters

)}, অনুমোদিত সীমা ${formatMeters(OFFICE_LOCATION.radiusMeters)}।`

);

return;

}


const payload = createPayload();


if (!payload) {

setSubmitStatus("error");

setSubmitMessage("Attendance payload তৈরি করা যায়নি।");

return;

}


setSubmitStatus("submitting");


try {

const response = await fetch(API_ENDPOINT, {

method: "POST",

headers: {

"Content-Type": "application/json",

"X-Attendance-Source": "gps-web",

},

body: JSON.stringify(payload),

});


if (!response.ok) {

throw new Error(`API failed with status ${response.status}`);

}


setLastSubmitted(payload);

setSubmitStatus("success");

setSubmitMessage(

attendanceType === "CHECK_IN"

? "সফলভাবে Check In সম্পন্ন হয়েছে।"

: "সফলভাবে Check Out সম্পন্ন হয়েছে।"

);

} catch {

saveOfflineAttendance(payload);

setLastSubmitted(payload);

setSubmitStatus("queued");

setSubmitMessage(

"সার্ভার পাওয়া যায়নি, তাই attendance offline queue-তে রাখা হয়েছে। API তৈরি করলে এটি sync করা যাবে।"

);

}

}, [attendanceType, createPayload, distanceMeters, isInsideGeofence, location]);


useEffect(() => {

checkPermission();


return () => {

if (typeof navigator !== "undefined" && watchIdRef.current !== null) {

navigator.geolocation.clearWatch(watchIdRef.current);

}

};

}, [checkPermission]);


const accuracyLabel = useMemo(() => {

if (!location) return "N/A";


if (location.accuracy <= 25) return "খুব ভালো";

if (location.accuracy <= 75) return "ভালো";

if (location.accuracy <= 150) return "মাঝারি";

return "কম নির্ভুল";

}, [location]);


return (

<main style={styles.page}>

<section style={styles.hero}>

<div>

<p style={styles.badge}>GPS Attendance 2026</p>

<h1 style={styles.title}>GPS ভিত্তিক Attendance</h1>

<p style={styles.subtitle}>

High Accuracy Location, Geofence Validation, Offline Queue এবং Modern Browser API

সাপোর্টসহ।

</p>

</div>


<div style={styles.statusCard}>

<span style={styles.statusLabel}>Permission</span>

<strong style={styles.statusValue}>

{permission === "checking"

? "Checking..."

: permission === "granted"

? "Allowed"

: permission === "denied"

? "Denied"

: permission === "prompt"

? "Ask"

: "Unsupported"}

</strong>

</div>

</section>


{!isSecureContextReady && (

<div style={styles.errorBox}>

GPS কাজ করার জন্য HTTPS প্রয়োজন। Development এর জন্য localhost ব্যবহার করুন।

</div>

)}


{geoError && <div style={styles.errorBox}>{geoError}</div>}


{submitMessage && (

<div

style={{

...styles.messageBox,

...(submitStatus === "success"

? styles.successBox

: submitStatus === "queued"

? styles.warningBox

: styles.errorBox),

}}

>

{submitMessage}

</div>

)}


<section style={styles.grid}>

<div style={styles.card}>

<h2 style={styles.cardTitle}>Attendance Type</h2>


<div style={styles.segment}>

<button

type="button"

onClick={() => setAttendanceType("CHECK_IN")}

style={{

...styles.segmentButton,

...(attendanceType === "CHECK_IN" ? styles.segmentButtonActive : {}),

}}

>

Check In

</button>


<button

type="button"

onClick={() => setAttendanceType("CHECK_OUT")}

style={{

...styles.segmentButton,

...(attendanceType === "CHECK_OUT" ? styles.segmentButtonActive : {}),

}}

>

Check Out

</button>

</div>


<div style={styles.buttonGroup}>

<button

type="button"

onClick={getCurrentLocation}

disabled={isLoadingLocation}

style={styles.primaryButton}

>

{isLoadingLocation ? "লোকেশন নেওয়া হচ্ছে..." : "বর্তমান লোকেশন নিন"}

</button>


{!isWatching ? (

<button type="button" onClick={startLiveTracking} style={styles.secondaryButton}>

Live Tracking চালু করুন

</button>

) : (

<button type="button" onClick={stopLiveTracking} style={styles.dangerButton}>

Live Tracking বন্ধ করুন

</button>

)}

</div>


<button

type="button"

onClick={submitAttendance}

disabled={!location || submitStatus === "submitting"}

style={{

...styles.submitButton,

...(!location || submitStatus === "submitting" ? styles.disabledButton : {}),

}}

>

{submitStatus === "submitting"

? "জমা দেওয়া হচ্ছে..."

: attendanceType === "CHECK_IN"

? "Check In জমা দিন"

: "Check Out জমা দিন"}

</button>

</div>


<div style={styles.card}>

<h2 style={styles.cardTitle}>Geofence Status</h2>


<div

style={{

...styles.geofenceBox,

...(location

? isInsideGeofence

? styles.geofenceInside

: styles.geofenceOutside

: {}),

}}

>

<span style={styles.geofenceIcon}>

{!location ? "📍" : isInsideGeofence ? "✅" : "⚠️"}

</span>


<div>

<strong>

{!location

? "লোকেশন পাওয়া যায়নি"

: isInsideGeofence

? "আপনি অফিস জোনের ভিতরে আছেন"

: "আপনি অফিস জোনের বাইরে আছেন"}

</strong>


<p style={styles.muted}>

{distanceMeters === null

? "দূরত্ব দেখতে লোকেশন নিন।"

: `অফিস থেকে দূরত্ব: ${formatMeters(distanceMeters)}`}

</p>

</div>

</div>


<div style={styles.infoList}>

<InfoRow label="Office" value={OFFICE_LOCATION.name} />

<InfoRow label="Allowed Radius" value={formatMeters(OFFICE_LOCATION.radiusMeters)} />

<InfoRow label="Accuracy" value={location ? `${Math.round(location.accuracy)} মিটার` : "N/A"} />

<InfoRow label="Accuracy Quality" value={accuracyLabel} />

</div>

</div>

</section>


<section style={styles.grid}>

<div style={styles.card}>

<h2 style={styles.cardTitle}>Your Current Location</h2>


<div style={styles.infoList}>

<InfoRow label="Latitude" value={location ? location.lat.toFixed(7) : "N/A"} />

<InfoRow label="Longitude" value={location ? location.lng.toFixed(7) : "N/A"} />

<InfoRow

label="Last Updated"

value={location ? formatDateTime(location.timestamp) : "N/A"}

/>

<InfoRow

label="Speed"

value={

location?.speed !== null && location?.speed !== undefined

? `${(location.speed * 3.6).toFixed(1)} কিমি/ঘণ্টা`

: "N/A"

}

/>

<InfoRow

label="Heading"

value={

location?.heading !== null && location?.heading !== undefined

? `${Math.round(location.heading)}°`

: "N/A"

}

/>

</div>


<div style={styles.linkGroup}>

<a

href={googleMapsLink}

target="_blank"

rel="noreferrer"

style={{

...styles.mapLink,

...(location ? {} : styles.disabledLink),

}}

>

Google Maps এ দেখুন

</a>


<a href={officeMapsLink} target="_blank" rel="noreferrer" style={styles.mapLink}>

Office Location দেখুন

</a>

</div>

</div>


<div style={styles.card}>

<h2 style={styles.cardTitle}>Submission Summary</h2>


{!lastSubmitted ? (

<p style={styles.muted}>এখনও কোনো attendance submit করা হয়নি।</p>

) : (

<div style={styles.infoList}>

<InfoRow label="ID" value={lastSubmitted.id} />

<InfoRow

label="Type"

value={lastSubmitted.type === "CHECK_IN" ? "Check In" : "Check Out"}

/>

<InfoRow label="Employee" value={lastSubmitted.employeeId} />

<InfoRow

label="Distance"

value={formatMeters(lastSubmitted.distanceMeters)}

/>

<InfoRow

label="Status"

value={lastSubmitted.isInsideGeofence ? "Inside Geofence" : "Outside Geofence"}

/>

<InfoRow

label="Time"

value={formatDateTime(new Date(lastSubmitted.createdAt).getTime())}

/>

</div>

)}

</div>

</section>

</main>

);

}


function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {

return (

<div style={styles.infoRow}>

<span style={styles.infoLabel}>{label}</span>

<strong style={styles.infoValue}>{value}</strong>

</div>

);

}


const styles: Record<string, React.CSSProperties> = {

page: {

minHeight: "100vh",

padding: "32px",

background:

"radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 32%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%)",

color: "#e5e7eb",

fontFamily:

'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

},

hero: {

display: "flex",

justifyContent: "space-between",

gap: "24px",

alignItems: "stretch",

marginBottom: "24px",

flexWrap: "wrap",

},

badge: {

display: "inline-flex",

padding: "8px 12px",

borderRadius: "999px",

background: "rgba(59,130,246,0.16)",

color: "#93c5fd",

border: "1px solid rgba(147,197,253,0.25)",

margin: 0,

marginBottom: "12px",

fontWeight: 700,

letterSpacing: "0.02em",

},

title: {

margin: 0,

fontSize: "clamp(30px, 5vw, 56px)",

lineHeight: 1,

letterSpacing: "-0.05em",

color: "#ffffff",

},

subtitle: {

marginTop: "14px",

maxWidth: "720px",

color: "#cbd5e1",

fontSize: "17px",

lineHeight: 1.7,

},

statusCard: {

minWidth: "220px",

padding: "20px",

borderRadius: "24px",

background: "rgba(15,23,42,0.72)",

border: "1px solid rgba(148,163,184,0.20)",

boxShadow: "0 24px 80px rgba(0,0,0,0.25)",

backdropFilter: "blur(16px)",

},

statusLabel: {

display: "block",

color: "#94a3b8",

fontSize: "13px",

marginBottom: "8px",

},

statusValue: {

display: "block",

fontSize: "28px",

color: "#ffffff",

},

grid: {

display: "grid",

gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",

gap: "20px",

marginBottom: "20px",

},

card: {

padding: "22px",

borderRadius: "26px",

background: "rgba(15,23,42,0.74)",

border: "1px solid rgba(148,163,184,0.18)",

boxShadow: "0 28px 80px rgba(0,0,0,0.28)",

backdropFilter: "blur(18px)",

},

cardTitle: {

margin: 0,

marginBottom: "18px",

color: "#ffffff",

fontSize: "22px",

letterSpacing: "-0.02em",

},

segment: {

display: "grid",

gridTemplateColumns: "1fr 1fr",

padding: "5px",

borderRadius: "18px",

background: "rgba(2,6,23,0.65)",

border: "1px solid rgba(148,163,184,0.16)",

marginBottom: "16px",

},

segmentButton: {

border: "none",

padding: "13px 14px",

borderRadius: "14px",

background: "transparent",

color: "#94a3b8",

cursor: "pointer",

fontWeight: 800,

fontSize: "15px",

},

segmentButtonActive: {

background: "linear-gradient(135deg, #2563eb, #7c3aed)",

color: "#ffffff",

boxShadow: "0 12px 30px rgba(37,99,235,0.32)",

},

buttonGroup: {

display: "grid",

gap: "12px",

marginBottom: "12px",

},

primaryButton: {

border: "none",

padding: "15px 18px",

borderRadius: "16px",

cursor: "pointer",

color: "#ffffff",

fontWeight: 900,

fontSize: "15px",

background: "linear-gradient(135deg, #0ea5e9, #2563eb)",

boxShadow: "0 18px 50px rgba(37,99,235,0.30)",

},

secondaryButton: {

border: "1px solid rgba(147,197,253,0.25)",

padding: "14px 18px",

borderRadius: "16px",

cursor: "pointer",

color: "#dbeafe",

fontWeight: 800,

fontSize: "15px",

background: "rgba(59,130,246,0.12)",

},

dangerButton: {

border: "1px solid rgba(252,165,165,0.30)",

padding: "14px 18px",

borderRadius: "16px",

cursor: "pointer",

color: "#fecaca",

fontWeight: 800,

fontSize: "15px",

background: "rgba(239,68,68,0.15)",

},

submitButton: {

width: "100%",

border: "none",

padding: "16px 18px",

borderRadius: "18px",

cursor: "pointer",

color: "#052e16",

fontWeight: 950,

fontSize: "16px",

background: "linear-gradient(135deg, #34d399, #a3e635)",

boxShadow: "0 20px 60px rgba(52,211,153,0.25)",

},

disabledButton: {

opacity: 0.55,

cursor: "not-allowed",

},

geofenceBox: {

display: "flex",

gap: "14px",

alignItems: "center",

padding: "18px",

borderRadius: "20px",

background: "rgba(30,41,59,0.60)",

border: "1px solid rgba(148,163,184,0.18)",

marginBottom: "18px",

},

geofenceInside: {

background: "rgba(22,163,74,0.14)",

border: "1px solid rgba(74,222,128,0.28)",

},

geofenceOutside: {

background: "rgba(239,68,68,0.13)",

border: "1px solid rgba(248,113,113,0.28)",

},

geofenceIcon: {

width: "44px",

height: "44px",

borderRadius: "16px",

display: "grid",

placeItems: "center",

background: "rgba(255,255,255,0.08)",

fontSize: "24px",

flex: "0 0 auto",

},

muted: {

color: "#94a3b8",

margin: "6px 0 0",

lineHeight: 1.55,

},

infoList: {

display: "grid",

gap: "10px",

},

infoRow: {

display: "flex",

justifyContent: "space-between",

gap: "14px",

padding: "13px 0",

borderBottom: "1px solid rgba(148,163,184,0.12)",

},

infoLabel: {

color: "#94a3b8",

fontSize: "14px",

},

infoValue: {

color: "#f8fafc",

textAlign: "right",

wordBreak: "break-word",

fontSize: "14px",

},

linkGroup: {

display: "flex",

flexWrap: "wrap",

gap: "10px",

marginTop: "18px",

},

mapLink: {

display: "inline-flex",

alignItems: "center",

justifyContent: "center",

textDecoration: "none",

color: "#bfdbfe",

border: "1px solid rgba(147,197,253,0.25)",

background: "rgba(59,130,246,0.10)",

padding: "11px 14px",

borderRadius: "14px",

fontWeight: 800,

},

disabledLink: {

pointerEvents: "none",

opacity: 0.45,

},

errorBox: {

padding: "14px 16px",

borderRadius: "18px",

background: "rgba(239,68,68,0.14)",

border: "1px solid rgba(248,113,113,0.28)",

color: "#fecaca",

marginBottom: "18px",

},

messageBox: {

padding: "14px 16px",

borderRadius: "18px",

marginBottom: "18px",

},

successBox: {

background: "rgba(22,163,74,0.14)",

border: "1px solid rgba(74,222,128,0.28)",

color: "#bbf7d0",

},

warningBox: {

background: "rgba(245,158,11,0.14)",

border: "1px solid rgba(251,191,36,0.28)",

color: "#fde68a",

},

};