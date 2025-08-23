"use client";

import { motion } from "framer-motion";

export default function WelcomeHero() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border p-6 md:p-8 bg-card">
      <div className="grid gap-3">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Save Smart, Grow Strong</h2>
        <p className="text-muted-foreground">
          Welcome to Heritage Coop App! Empower your future with our cooperative savings platform. Join millions in building wealth through daily contributions and unlock loans tailored for your needs.
        </p>
      </div>
    </motion.div>
  );
}


