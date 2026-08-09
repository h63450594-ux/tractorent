import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Search, MapPin, Gauge, Calendar, ChevronRight, X, Check,
  LayoutDashboard, Tractor, ClipboardList, Settings, Bot,
  TrendingUp, Sparkles, Mail, Star, Menu, ArrowRight, Plus,
  Trash2, Pencil, BarChart3, Globe2, MessageCircle, ShieldCheck, Clock,
  Heart, BadgeCheck, Lock, LogOut, Loader2
} from "lucide-react";

/* ---------------------------------------------------------
   DONNEES SIMULEES
--------------------------------------------------------- */

/* Image de secours si une photo externe ne charge pas (ex: aperçu en bac à sable) */
const FALLBACK_IMG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMUMzQjJBIi8+CjxjaXJjbGUgY3g9IjU1IiBjeT0iOTAiIHI9IjE4IiBmaWxsPSIjMTQyMDFBIiBzdHJva2U9IiNDOUEyMjciIHN0cm9rZS13aWR0aD0iMyIvPgo8Y2lyY2xlIGN4PSIxNDUiIGN5PSI5NSIgcj0iMjYiIGZpbGw9IiMxNDIwMUEiIHN0cm9rZT0iI0M5QTIyNyIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxyZWN0IHg9IjcwIiB5PSI1NSIgd2lkdGg9IjU1IiBoZWlnaHQ9IjMwIiByeD0iNCIgZmlsbD0iI0M5QTIyNyIvPgo8cmVjdCB4PSI5NSIgeT0iMzUiIHdpZHRoPSIyMiIgaGVpZ2h0PSIyNiIgcng9IjMiIGZpbGw9IiNGNkYzRUEiLz4KPHJlY3QgeD0iMzUiIHk9IjcwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTQiIHJ4PSIzIiBmaWxsPSIjQzlBMjI3Ii8+Cjwvc3ZnPg==";

/* Pool de vraies photos (libres de droits) utilisées pour les nouveaux tracteurs ajoutés depuis l'admin */
const PHOTO_POOL = [
  "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70",
  "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70",
];

const SEED_TRACTORS = [
  {
    id: 1, name: "Fendt 942 Vario", brand: "Fendt", country: "Allemagne",
    location: "Bavière", power: 420, year: 2023, transmission: "Vario CVT",
    use: "Grandes cultures, travaux lourds", day: 480, week: 2600, month: 8900,
    deposit: 4500, rating: 4.9, images: ["https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 2, name: "John Deere 6155R", brand: "John Deere", country: "France",
    location: "Beauce", power: 155, year: 2022, transmission: "AutoPowr",
    use: "Polyvalent, exploitation moyenne", day: 260, week: 1450, month: 4900,
    deposit: 2200, rating: 4.7, images: ["https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 3, name: "New Holland T7.315", brand: "New Holland", country: "Italie",
    location: "Émilie-Romagne", power: 315, year: 2021, transmission: "Powershift",
    use: "Labour, travaux lourds", day: 340, week: 1890, month: 6400,
    deposit: 3100, rating: 4.6, images: ["https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 4, name: "Massey Ferguson 5713", brand: "Massey Ferguson", country: "Espagne",
    location: "Andalousie", power: 130, year: 2020, transmission: "Dyna-4",
    use: "Petites exploitations, verger", day: 180, week: 1010, month: 3400,
    deposit: 1500, rating: 4.5, images: ["https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 5, name: "Case IH Puma 240", brand: "Case IH", country: "Maroc",
    location: "Meknès", power: 240, year: 2022, transmission: "Powerdrive",
    use: "Grandes cultures", day: 300, week: 1670, month: 5600,
    deposit: 2600, rating: 4.8, images: ["https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 6, name: "Kubota M7-172", brand: "Kubota", country: "France",
    location: "Bretagne", power: 172, year: 2023, transmission: "Powershift",
    use: "Élevage, fourrage", day: 220, week: 1230, month: 4100,
    deposit: 1900, rating: 4.7, images: ["https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 7, name: "Fendt 724 Vario", brand: "Fendt", country: "Roumanie",
    location: "Timiș", power: 240, year: 2022, transmission: "Vario CVT",
    use: "Grandes cultures céréalières", day: 290, week: 1620, month: 5500,
    deposit: 2500, rating: 4.8, images: ["https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 8, name: "Ursus 8014H", brand: "Ursus", country: "Pologne",
    location: "Grande-Pologne", power: 140, year: 2021, transmission: "Powershift",
    use: "Exploitation moyenne, polyvalent", day: 195, week: 1090, month: 3700,
    deposit: 1650, rating: 4.5, images: ["https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 9, name: "Zetor Forterra 150", brand: "Zetor", country: "Roumanie",
    location: "Cluj", power: 150, year: 2020, transmission: "Powershuttle",
    use: "Grandes cultures, transport", day: 200, week: 1120, month: 3800,
    deposit: 1700, rating: 4.4, images: ["https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 10, name: "Valtra N155", brand: "Valtra", country: "Finlande",
    location: "Ostrobotnie", power: 155, year: 2022, transmission: "Powershift",
    use: "Forêt et grandes cultures nordiques", day: 250, week: 1400, month: 4700,
    deposit: 2100, rating: 4.8, images: ["https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 11, name: "MTZ Belarus 892", brand: "Belarus", country: "Lituanie",
    location: "Kaunas", power: 92, year: 2019, transmission: "Mécanique",
    use: "Petites exploitations, polyvalent", day: 140, week: 780, month: 2600,
    deposit: 1100, rating: 4.3, images: ["https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 12, name: "John Deere 6120M", brand: "John Deere", country: "Estonie",
    location: "Tartu", power: 120, year: 2021, transmission: "PowrQuad",
    use: "Fourrage, élevage", day: 210, week: 1170, month: 3900,
    deposit: 1750, rating: 4.6, images: ["https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 13, name: "New Holland T6.155", brand: "New Holland", country: "Ukraine",
    location: "Vinnytsia", power: 155, year: 2020, transmission: "Powershift",
    use: "Grandes cultures céréalières", day: 230, week: 1290, month: 4300,
    deposit: 1900, rating: 4.5, images: ["https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 14, name: "Case IH Farmall 105U", brand: "Case IH", country: "Moldavie",
    location: "Chișinău", power: 105, year: 2019, transmission: "Powershuttle",
    use: "Viticulture, petites parcelles", day: 160, week: 900, month: 3000,
    deposit: 1300, rating: 4.4, images: ["https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 15, name: "Kubota M8560", brand: "Kubota", country: "Géorgie",
    location: "Kakhétie", power: 85, year: 2021, transmission: "Powershift",
    use: "Viticulture, verger", day: 150, week: 840, month: 2800,
    deposit: 1200, rating: 4.6, images: ["https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 16, name: "Massey Ferguson 7719", brand: "Massey Ferguson", country: "Kazakhstan",
    location: "Akmola", power: 190, year: 2022, transmission: "Dyna-VT",
    use: "Grandes steppes céréalières", day: 270, week: 1510, month: 5100,
    deposit: 2300, rating: 4.7, images: ["https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 17, name: "Belarus 3022", brand: "Belarus", country: "Biélorussie",
    location: "Minsk", power: 220, year: 2021, transmission: "Powershift",
    use: "Grandes cultures céréalières", day: 210, week: 1170, month: 3900,
    deposit: 1800, rating: 4.3, images: ["https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 18, name: "Same Argon3", brand: "Same", country: "Albanie",
    location: "Tirana", power: 200, year: 2021, transmission: "Powershift",
    use: "Grandes cultures céréalières", day: 270, week: 1510, month: 5000,
    deposit: 2000, rating: 4.3, images: ["https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 19, name: "Kubota M5", brand: "Kubota", country: "Andorre",
    location: "Andorre-la-Vieille", power: 95, year: 2019, transmission: "Powershift",
    use: "Polyvalent, exploitation moyenne", day: 130, week: 730, month: 2400,
    deposit: 1000, rating: 4.4, images: ["https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 20, name: "Lindner Lintrac 90", brand: "Lindner", country: "Autriche",
    location: "Tyrol", power: 200, year: 2023, transmission: "Powershift",
    use: "Viticulture, petites parcelles", day: 270, week: 1510, month: 5000,
    deposit: 2000, rating: 4.7, images: ["https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 21, name: "Claas Arion 460", brand: "Claas", country: "Belgique",
    location: "Wallonie", power: 75, year: 2019, transmission: "Powershift",
    use: "Élevage, fourrage", day: 100, week: 560, month: 1850,
    deposit: 750, rating: 4.6, images: ["https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 22, name: "IMT 533", brand: "IMT", country: "Bosnie-Herzégovine",
    location: "Banja Luka", power: 65, year: 2020, transmission: "Powershift",
    use: "Verger, arboriculture", day: 90, week: 500, month: 1660,
    deposit: 700, rating: 4.3, images: ["https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 23, name: "John Deere 6110M", brand: "John Deere", country: "Bulgarie",
    location: "Plovdiv", power: 160, year: 2023, transmission: "Powershift",
    use: "Petites exploitations urbaines", day: 215, week: 1200, month: 3980,
    deposit: 1600, rating: 4.6, images: ["https://images.unsplash.com/photo-1633555269939-bc019a4bc4b6?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1713207668892-af3f13510d18?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1758030845352-1b69b013f81f?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1717702576954-c07131c54169?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 24, name: "Landini 5-100", brand: "Landini", country: "Croatie",
    location: "Slavonie", power: 95, year: 2023, transmission: "Powershift",
    use: "Maraîchage et jardins", day: 130, week: 730, month: 2400,
    deposit: 1000, rating: 4.7, images: ["https://images.unsplash.com/photo-1755498591537-eb54d2d54351?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1653156392599-10de5367c555?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1760635165251-5a3a81425a89?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1780260191867-1af3f19f1c3f?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 25, name: "Kubota M7001", brand: "Kubota", country: "Chypre",
    location: "Nicosie", power: 130, year: 2023, transmission: "Powershift",
    use: "Montagne, terrain en pente", day: 175, week: 980, month: 3240,
    deposit: 1300, rating: 4.4, images: ["https://images.unsplash.com/photo-1568680870491-590cd4e224ab?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1601593797922-325abb0f763d?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1719254500669-2bc432c43933?auto=format&fit=crop&w=800&h=600&q=70", "https://images.unsplash.com/photo-1755069520895-4a69edc47301?auto=format&fit=crop&w=800&h=600&q=70"]
  },
  {
    id: 26, name: "Zetor Proxima 100", brand: "Zetor", country: "Républiq
