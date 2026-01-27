import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { usersApi, notesApi, filesApi, SharedUser } from "../lib/api";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemType: 'note' | 'file';
    itemId: number;
    onShareUpdate?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    itemType,
    itemId,
    onShareUpdate
}) => {
    const [users, setUsers] = useState<SharedUser[]>([]);
    const [currentlySharedWith, setCurrentlySharedWith] = useState<SharedUser[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch users and currently shared-with list
    useEffect(() => {
        if (isOpen && itemId) {
            fetchData();
        }
    }, [isOpen, itemId, itemType]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all users
            const allUsers = await usersApi.getAll();
            setUsers(allUsers);

            // Fetch current shared-with list
            const sharedWith = itemType === 'note'
                ? await notesApi.getSharedWith(itemId)
                : await filesApi.getSharedWith(itemId);

            setCurrentlySharedWith(sharedWith);
            setSelectedUserIds(new Set(sharedWith.map(u => u.id)));
        } catch (err: any) {
            console.error("Failed to fetch sharing data:", err);
            setError(err.response?.data?.error || "Failed to load sharing information");
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = (userId: number) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            const currentIds = currentlySharedWith.map(u => u.id);
            const newIds = Array.from(selectedUserIds);

            // Find users to add (in newIds but not in currentIds)
            const toAdd = newIds.filter(id => !currentIds.includes(id));

            // Find users to remove (in currentIds but not in newIds)
            const toRemove = currentIds.filter(id => !newIds.includes(id));

            // Add new shares
            if (toAdd.length > 0) {
                if (itemType === 'note') {
                    await notesApi.share(itemId, toAdd);
                } else {
                    await filesApi.share(itemId, toAdd);
                }
            }

            // Remove shares
            for (const userId of toRemove) {
                if (itemType === 'note') {
                    await notesApi.unshare(itemId, userId);
                } else {
                    await filesApi.unshare(itemId, userId);
                }
            }

            onShareUpdate?.();
            onClose();
        } catch (err: any) {
            console.error("Failed to update sharing:", err);
            setError(err.response?.data?.error || "Failed to update sharing settings");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveUser = async (userId: number) => {
        try {
            if (itemType === 'note') {
                await notesApi.unshare(itemId, userId);
            } else {
                await filesApi.unshare(itemId, userId);
            }
            // Refresh the data
            fetchData();
            onShareUpdate?.();
        } catch (err: any) {
            console.error("Failed to remove user:", err);
            setError(err.response?.data?.error || "Failed to remove user");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-surface-dark border-border text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">share</span>
                        Share {itemType === 'note' ? 'Note' : 'File'}
                    </DialogTitle>
                    <DialogDescription className="text-text-secondary">
                        Select users to share this {itemType} with. They'll be able to view it in their shared items.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-red-400 text-sm text-center py-4">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Currently shared with */}
                            {currentlySharedWith.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold uppercase text-text-secondary mb-2">
                                        Currently shared with
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentlySharedWith.map((user) => (
                                            <Badge
                                                key={user.id}
                                                variant="secondary"
                                                className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-pointer group flex items-center gap-1"
                                            >
                                                {user.displayName || user.username}
                                                <button
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    className="ml-1 opacity-60 hover:opacity-100"
                                                    title="Remove"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* User selection list */}
                            <div>
                                <p className="text-xs font-bold uppercase text-text-secondary mb-2">
                                    Select users to share with
                                </p>
                                {users.length === 0 ? (
                                    <p className="text-sm text-text-secondary italic py-2">
                                        No other users available
                                    </p>
                                ) : (
                                    <div className="max-h-[200px] overflow-y-auto space-y-1 bg-background-dark rounded-lg border border-border p-2">
                                        {users.map((user) => (
                                            <label
                                                key={user.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-dark cursor-pointer transition-colors"
                                            >
                                                <Checkbox
                                                    checked={selectedUserIds.has(user.id)}
                                                    onCheckedChange={() => handleUserToggle(user.id)}
                                                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="size-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                        {(user.displayName || user.username).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-white font-medium">
                                                            {user.displayName || user.username}
                                                        </span>
                                                        {user.email && (
                                                            <span className="text-[10px] text-text-secondary">
                                                                {user.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedUserIds.has(user.id) && !currentlySharedWith.find(u => u.id === user.id) && (
                                                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                                                        NEW
                                                    </Badge>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-transparent border-border text-white hover:bg-surface-dark hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-primary text-background-dark hover:bg-primary/90"
                    >
                        {saving ? (
                            <>
                                <span className="size-4 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px] mr-1">check</span>
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShareModal;
