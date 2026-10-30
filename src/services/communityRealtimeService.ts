import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  CommunityPost, 
  CommunityComment, 
  ClubCommunityConfig, 
  HistoricalMemory 
} from '../types/community';

export type CommunityRealtimeEvent =
  | 'NEW_POST'
  | 'NEW_COMMENT'
  | 'TOGGLE_REACTION'
  | 'UPDATE_ATTENDANCE'
  | 'CAST_VOTE'
  | 'UPDATE_CONFIG'
  | 'NEW_MEMORY';

export interface CommunityRealtimePayload {
  teamId: string;
  eventType: CommunityRealtimeEvent;
  post?: CommunityPost;
  comment?: CommunityComment;
  reactionData?: { postId: string; emoji: string; userId: string; hasReacted: boolean };
  attendanceData?: { teamId: string; userId: string; status: 'yes' | 'no' };
  voteData?: { voteId: string; optionId: string; userId: string };
  configData?: ClubCommunityConfig;
  memoryData?: HistoricalMemory;
  timestamp: number;
}

/**
 * Emite una acción comunitaria en tiempo real a todos los miembros conectados del club
 */
export async function broadcastCommunityUpdate(
  teamId: string, 
  eventType: CommunityRealtimeEvent, 
  payload: Partial<CommunityRealtimePayload>
): Promise<void> {
  try {
    const channelName = `club-community-${teamId}`;
    const channel = supabase.channel(channelName);
    
    await channel.send({
      type: 'broadcast',
      event: 'COMMUNITY_EVENT',
      payload: {
        teamId,
        eventType,
        timestamp: Date.now(),
        ...payload,
      },
    });

    // Persistencia opcional en Supabase si está configurado
    if (isSupabaseConfigured() && payload.post) {
      try {
        await Promise.resolve(
          supabase
            .from('community_posts')
            .upsert({
              id: payload.post.id,
              team_id: teamId,
              author_id: payload.post.authorId,
              author_name: payload.post.authorName,
              content: payload.post.content,
              image_url: payload.post.imageUrl,
              type: payload.post.type,
              is_pinned: payload.post.isPinned,
              reactions: payload.post.reactions,
              comments: payload.post.comments,
              created_at: payload.post.createdAt,
            })
        ).catch(() => {});
      } catch {
        // Silencioso si la tabla no está creada
      }
    }
  } catch (error) {
    console.warn('Realtime community broadcast error:', error);
  }
}

/**
 * Hook para escuchar en vivo eventos de la comunidad del club
 */
export function useRealtimeClubCommunity(
  teamId: string | null | undefined,
  onEvent: (payload: CommunityRealtimePayload) => void
) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!teamId) return;

    const channelName = `club-community-${teamId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on('broadcast', { event: 'COMMUNITY_EVENT' }, ({ payload }) => {
        if (!payload || payload.teamId !== teamId) return;
        onEventRef.current(payload as CommunityRealtimePayload);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [teamId]);
}
