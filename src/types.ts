export const ACTIONS = {
    createColumn: 'newColumn' as const,
    updateColumn: 'updateColumn' as const,
    updateColumnName: 'updateColumnName' as const,
    createItem: 'createItem' as const,
    moveItem: 'moveItem' as const,
    moveColumn: 'moveColumn' as const,
    updateBoardName: 'updateBoardName' as const,
    deleteItem: 'deleteItem' as const,
}

export interface RenderedItem {
    id: string
    title: string
    order: number
    content: string | null
    columnId: string
}
