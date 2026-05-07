"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAutoSelect } from "@/hooks/use-auto-select";
import { useGroupedItems } from "@/hooks/use-grouped-items";
import { type Group } from "@/hooks/use-grouped-items";
import { useMutation } from "@/hooks/use-mutation";
import { toast } from "sonner";

import {
  type CategoryRecord,
  type CategoriesPayload,
  type DeletePayload,
  type QuestFormState,
  type QuestMutationPayload,
  type QuestRecord,
  type QuestType,
  type QuestsPayload,
  createEmptyFormState,
  createFormStateFromQuest,
  readQuestJson,
} from "@/components/quests/quest-types";

export type QuestManagerState = {
  quests: QuestRecord[];
  categories: CategoryRecord[];
  groupedQuests: Group<QuestRecord>[];
  selectedQuest: QuestRecord | null;
  stats: { visible: number; active: number; inactive: number };
  searchInput: string;
  selectedCategoryId: string | null;
  selectedQuestType: QuestType | null;
  includeInactive: boolean;
  isMobileDetailOpen: boolean;
  isLoadingCategories: boolean;
  isLoadingQuests: boolean;
  formMode: "create" | "edit" | null;
  formState: QuestFormState;
  formError: string | null;
  deleteTarget: QuestRecord | null;
  errorMessage: string | null;
  isPending: boolean;
  hasNoCategories: boolean;
  hasNoVisibleQuests: boolean;
  hasActiveFilters: boolean;
  setSearchInput: Dispatch<SetStateAction<string>>;
  setSelectedCategoryId: Dispatch<SetStateAction<string | null>>;
  setSelectedQuestType: Dispatch<SetStateAction<QuestType | null>>;
  setIncludeInactive: Dispatch<SetStateAction<boolean>>;
  setSelectedQuestId: Dispatch<SetStateAction<string | null>>;
  setIsMobileDetailOpen: Dispatch<SetStateAction<boolean>>;
  setDeleteTarget: Dispatch<SetStateAction<QuestRecord | null>>;
  setFormState: Dispatch<SetStateAction<QuestFormState>>;
  openCreateForm: () => void;
  openEditForm: (quest: QuestRecord) => void;
  closeForm: () => void;
  handleSaveQuest: () => void;
  handleToggleActive: (quest: QuestRecord) => void;
  handleDelete: () => void;
};

export function useQuestManager(): QuestManagerState {
  const [quests, setQuests] = useState<QuestRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedQuestType, setSelectedQuestType] = useState<QuestType | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [formState, setFormState] = useState<QuestFormState>(createEmptyFormState([]));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestRecord | null>(null);
  const { errorMessage, isPending, runMutation, setError } = useMutation();

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories", { cache: "no-store" });
    const payload = await readQuestJson<CategoriesPayload>(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load lists.");
    }

    return payload.categories;
  }, []);

  const fetchQuests = useCallback(
    async (options?: {
      search?: string;
      categoryId?: string | null;
      questType?: QuestType | null;
      includeInactive?: boolean;
    }) => {
      const search = options?.search ?? deferredSearch.trim();
      const categoryId = options?.categoryId ?? selectedCategoryId;
      const questType = options?.questType ?? selectedQuestType;
      const nextIncludeInactive = options?.includeInactive ?? includeInactive;
      const searchParams = new URLSearchParams();

      if (search) searchParams.set("search", search);
      if (categoryId) searchParams.set("categoryId", categoryId);
      if (questType) searchParams.set("questType", questType);
      if (nextIncludeInactive) searchParams.set("includeInactive", "true");

      const query = searchParams.toString();
      const response = await fetch(
        query ? `/api/quests?${query}` : "/api/quests",
        { cache: "no-store" },
      );
      const payload = await readQuestJson<QuestsPayload>(response);

      if (!response.ok || !payload?.quests) {
        throw new Error(payload?.error ?? "Failed to load tasks.");
      }

      return payload.quests;
    },
    [deferredSearch, includeInactive, selectedCategoryId, selectedQuestType],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const nextCategories = await fetchCategories();

        if (!cancelled) {
          setCategories(nextCategories);
          setFormState((current) => {
            if (current.categoryId || nextCategories.length === 0) return current;
            return { ...current, categoryId: nextCategories[0].id };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load lists.");
        }
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [fetchCategories, setError]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

      try {
        const nextQuests = await fetchQuests();
        if (!cancelled) setQuests(nextQuests);
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load tasks.");
        }
      } finally {
        if (!cancelled) setIsLoadingQuests(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [fetchQuests, setError]);

  const selectedQuest = useAutoSelect(quests, selectedQuestId, setSelectedQuestId);
  const groupedQuests = useGroupedItems(quests, "categoryId", (quest) => quest.category.name);

  const stats = useMemo(() => {
    const activeCount = quests.filter((q) => q.isActive).length;
    return { visible: quests.length, active: activeCount, inactive: quests.length - activeCount };
  }, [quests]);

  const hasNoCategories = !isLoadingCategories && categories.length === 0;
  const hasNoVisibleQuests = !isLoadingQuests && !hasNoCategories && quests.length === 0;
  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    selectedCategoryId !== null ||
    selectedQuestType !== null ||
    includeInactive;

  const closeForm = () => {
    setFormMode(null);
    setEditingQuestId(null);
    setFormError(null);
  };

  const refreshQuests = async () => {
    const nextQuests = await fetchQuests();
    setQuests(nextQuests);
  };

  const openCreateForm = () => {
    if (!categories.length) {
      setError("Create a list first before adding tasks.");
      return;
    }

    setFormMode("create");
    setEditingQuestId(null);
    setFormError(null);
    setFormState(createEmptyFormState(categories));
  };

  const openEditForm = (quest: QuestRecord) => {
    setFormMode("edit");
    setEditingQuestId(quest.id);
    setFormError(null);
    setFormState(createFormStateFromQuest(quest));
  };

  const handleSaveQuest = () => {
    const title = formState.title.trim();

    if (!title) { setFormError("Title is required."); return; }
    if (!formState.categoryId) { setFormError("List is required."); return; }

    setFormError(null);

    runMutation(async () => {
      const isEditing = formMode === "edit" && editingQuestId;
      const response = await fetch(
        isEditing ? `/api/quests/${editingQuestId}` : "/api/quests",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            categoryId: formState.categoryId,
            title,
            description: formState.description,
            questType: formState.questType,
            isActive: formState.isActive,
          }),
        },
      );
      const payload = await readQuestJson<QuestMutationPayload>(response);

      if (!response.ok || !payload?.quest) {
        setFormError(payload?.error ?? "Failed to save task.");
        return;
      }

      toast.success(isEditing ? `Updated "${title}".` : `Created "${title}".`);
      closeForm();
      setSelectedQuestId(payload.quest.id);
      await refreshQuests();
    });
  };

  const handleToggleActive = (quest: QuestRecord) => {
    runMutation(async () => {
      const response = await fetch(`/api/quests/${quest.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !quest.isActive }),
      });
      const payload = await readQuestJson<QuestMutationPayload>(response);

      if (!response.ok || !payload?.quest) {
        throw new Error(payload?.error ?? "Failed to update task status.");
      }

      toast.success(
        payload.quest.isActive
          ? `Reactivated "${payload.quest.title}".`
          : `Deactivated "${payload.quest.title}".`,
      );

      if (editingQuestId === quest.id) {
        setFormState(createFormStateFromQuest(payload.quest));
      }

      await refreshQuests();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    runMutation(async () => {
      const response = await fetch(`/api/quests/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readQuestJson<DeletePayload>(response);

      if (!response.ok && response.status !== 204) {
        throw new Error(payload?.error ?? "Failed to delete task.");
      }

      toast.success(`Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);

      if (selectedQuestId === deleteTarget.id) setSelectedQuestId(null);

      await refreshQuests();
    });
  };

  return {
    quests,
    categories,
    groupedQuests,
    selectedQuest,
    stats,
    searchInput,
    selectedCategoryId,
    selectedQuestType,
    includeInactive,
    isMobileDetailOpen,
    isLoadingCategories,
    isLoadingQuests,
    formMode,
    formState,
    formError,
    deleteTarget,
    errorMessage,
    isPending,
    hasNoCategories,
    hasNoVisibleQuests,
    hasActiveFilters,
    setSearchInput,
    setSelectedCategoryId,
    setSelectedQuestType,
    setIncludeInactive,
    setSelectedQuestId,
    setIsMobileDetailOpen,
    setDeleteTarget,
    setFormState,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSaveQuest,
    handleToggleActive,
    handleDelete,
  };
}
