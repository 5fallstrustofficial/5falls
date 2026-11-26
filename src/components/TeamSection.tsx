"use client";

import React, { useEffect, useState } from "react";
import { Globe, ExternalLink, Link2, Users } from "lucide-react";
import type { TeamMember } from "@/data/teamData";
import { useLanguage } from "@/context/LanguageContext";

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "5F"
  );
}

export default function TeamSection() {
  const { isTamil } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { members?: TeamMember[] } | null) => {
        if (data?.members) {
          setMembers(data.members);
        }
      })
      .catch(() => {
        // Ignore network errors cleanly
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || members.length === 0) {
    return null;
  }

  return (
    <section
      id="team"
      className="py-16 sm:py-20 px-4 sm:px-6 bg-[#f9fafb] border-t border-[#dce2ea]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>{isTamil ? "எங்கள் குழு" : "Our Team"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
            {isTamil ? "அறக்கட்டளை குழுவினர்" : "People Behind the Revival"}
          </h2>
          <p className="text-ink-slate text-sm sm:text-base">
            {isTamil
              ? "புதுத்தாங்கல் ஏரி மறுசீரமைப்பு மற்றும் சமூகப் பணிகளை வழிநடத்தும் குழுவினர்."
              : "Trustees, field coordinators, and community leaders driving Five Falls Women's Welfare Trust."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => {
            const socialLinks = [
              {
                key: "instagram",
                url: member.socials?.instagram,
                icon: Link2,
                label: "Instagram",
              },
              {
                key: "linkedin",
                url: member.socials?.linkedin,
                icon: Link2,
                label: "LinkedIn",
              },
              {
                key: "facebook",
                url: member.socials?.facebook,
                icon: Link2,
                label: "Facebook",
              },
              {
                key: "twitter",
                url: member.socials?.twitter,
                icon: ExternalLink,
                label: "X / Twitter",
              },
              {
                key: "website",
                url: member.socials?.website,
                icon: Globe,
                label: "Website",
              },
            ].filter((s) => Boolean(s.url));

            return (
              <div
                key={member.id}
                className="bg-white rounded-modal border border-[#dce2ea] p-6 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#dce2ea] bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{getInitials(member.name)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-ink leading-snug">
                        {member.name}
                      </h3>
                      {member.roleTitle && (
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          {member.roleTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-ink-slate leading-relaxed">
                    {member.description}
                  </p>
                </div>

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#dce2ea]">
                    {socialLinks.map((s) => {
                      const Icon = s.icon;
                      return (
                        <a
                          key={s.key}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on ${s.label}`}
                          title={s.label}
                          className="w-8 h-8 rounded-full border border-[#dce2ea] bg-[#f9fafb] text-ink-slate hover:text-primary hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
