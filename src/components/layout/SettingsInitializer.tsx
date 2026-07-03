'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getSettingsAction } from '@/features/settings/actions';
import { getSponsorsAction } from '@/features/homepage/actions';
import { getBlogPostsAction } from '@/features/blog/actions';
import { getParticipantsAction } from '@/features/participants/actions';
import { getAnnouncementsAction } from '@/features/announcements/actions';
import { getGalleryItemsAction } from '@/features/gallery/actions';

export function SettingsInitializer() {
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setSponsors = useAppStore((state) => state.setSponsors);
  const setBlogPosts = useAppStore((state) => state.setBlogPosts);
  const setParticipants = useAppStore((state) => state.setParticipants);
  const setAnnouncements = useAppStore((state) => state.setAnnouncements);
  const setGalleryItems = useAppStore((state) => state.setGalleryItems);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [dbSettings, dbSponsors, dbBlogPosts, dbParticipants, dbAnnouncements, dbGalleryItems] = await Promise.all([
          getSettingsAction(),
          getSponsorsAction(),
          getBlogPostsAction(),
          getParticipantsAction(),
          getAnnouncementsAction(),
          getGalleryItemsAction()
        ]);

        if (dbSettings) {
          updateSettings(dbSettings);
        }
        if (dbSponsors && dbSponsors.length > 0) {
          setSponsors(dbSponsors);
        }
        if (dbBlogPosts && dbBlogPosts.length > 0) {
          setBlogPosts(dbBlogPosts);
        }
        if (dbParticipants && dbParticipants.length > 0) {
          setParticipants(dbParticipants);
        }
        if (dbAnnouncements && dbAnnouncements.length > 0) {
          setAnnouncements(dbAnnouncements);
        }
        if (dbGalleryItems && dbGalleryItems.length > 0) {
          setGalleryItems(dbGalleryItems);
        }
      } catch (err) {
        console.error('[SettingsInitializer] Error fetching dynamic application states:', err);
      }
    }
    loadAllData();
  }, [updateSettings, setSponsors, setBlogPosts, setParticipants, setAnnouncements, setGalleryItems]);


  return null;
}
