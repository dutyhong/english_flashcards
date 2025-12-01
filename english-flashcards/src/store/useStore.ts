import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface ReviewWord {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  sentences: {
    english: string;
    chinese: string;
    explanation: string;
  }[];
  dateAdded: number;
}

interface AppState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  
  apiKey: string;
  setApiKey: (key: string) => void;
  
  reviewList: ReviewWord[];
  loading: boolean;
  
  fetchWords: () => Promise<void>;
  addWord: (word: Omit<ReviewWord, 'id' | 'dateAdded'>) => Promise<void>;
  removeWord: (id: string) => Promise<void>;
  clearAllWords: () => Promise<void>;
  
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => {
        set({ session });
        if (session) {
          get().fetchWords();
        } else {
          set({ reviewList: [] }); // Clear list on logout
        }
      },

      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      reviewList: [],
      loading: false,

      isDemoMode: true,
      setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),

      fetchWords: async () => {
        const { session } = get();
        if (!session) return;

        set({ loading: true });
        const { data, error } = await supabase
          .from('user_words')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Fetch words error:', error);
        } else {
          // Map Supabase data structure to ReviewWord
          const words: ReviewWord[] = data.map((row: any) => ({
            id: row.id,
            word: row.content.word,
            meaning: row.content.meaning,
            pronunciation: row.content.pronunciation,
            sentences: row.content.sentences,
            dateAdded: new Date(row.created_at).getTime(),
          }));
          set({ reviewList: words });
        }
        set({ loading: false });
      },

      addWord: async (wordDetail) => {
        const { session, reviewList } = get();
        // Avoid duplicates locally first check
        if (reviewList.some((w) => w.word.toLowerCase() === wordDetail.word.toLowerCase())) {
          return;
        }

        // Optimistic update (optional, but let's stick to consistent server state for now)
        // Actually, if we don't have session (Demo Mode), we just update local state
        if (!session) {
            const newWord: ReviewWord = {
                id: Date.now().toString(),
                dateAdded: Date.now(),
                ...wordDetail
            };
            set({ reviewList: [newWord, ...reviewList] });
            return;
        }

        const { data, error } = await supabase
          .from('user_words')
          .insert({
            userid: session.user.id,
            content: wordDetail, // Store the whole JSON object
          })
          .select()
          .single();

        if (error) {
          console.error('Add word error:', error);
        } else if (data) {
          const newWord: ReviewWord = {
            id: data.id,
            word: data.content.word,
            meaning: data.content.meaning,
            pronunciation: data.content.pronunciation,
            sentences: data.content.sentences,
            dateAdded: new Date(data.created_at).getTime(),
          };
          set({ reviewList: [newWord, ...reviewList] });
        }
      },

      removeWord: async (id) => {
        const { session, reviewList } = get();
        
        if (!session) {
            set({ reviewList: reviewList.filter(w => w.id !== id) });
            return;
        }

        const { error } = await supabase.from('user_words').delete().eq('id', id);
        if (error) {
          console.error('Delete word error:', error);
        } else {
          set({ reviewList: reviewList.filter((w) => w.id !== id) });
        }
      },

  clearAllWords: async () => {
      const { session } = get();
      if (!session) {
          set({ reviewList: [] });
          return;
      }
      
      // Explicitly delete based on user_id to ensure RLS works expectedly and we target right rows
      const { error } = await supabase.from('user_words').delete().eq('userid', session.user.id);
      
      if (error) {
          console.error('Clear words error:', error);
      } else {
          set({ reviewList: [] });
      }
  }
    }),
    {
      name: 'english-flashcards-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ apiKey: state.apiKey, isDemoMode: state.isDemoMode }), // Only persist these fields
    }
  )
);
