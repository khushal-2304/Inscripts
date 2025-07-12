"use client"

import type React from "react"
import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import {
  ChevronDown,
  Search,
  Bell,
  EyeOff,
  ArrowUpDown,
  Filter,
  Grid3X3,
  Download,
  Upload,
  Share,
  Plus,
} from "lucide-react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface TaskData {
  id: number
  jobRequest: string
  submitted: string
  status: "In-progress" | "Need to start" | "Complete" | "Blocked"
  submitter: string
  url: string
  assigned: string
  priority: "High" | "Medium" | "Low"
  dueDate: string
  estValue: string
}

interface CellPosition {
  rowIndex: number
  columnId: string
}

const mockData: TaskData[] = [
  {
    id: 1,
    jobRequest: "Launch social media campaign for pro...",
    submitted: "15-11-2024",
    status: "In-progress",
    submitter: "Aisha Patel",
    url: "www.aishapatel...",
    assigned: "Sophie Choudhury",
    priority: "Medium",
    dueDate: "20-11-2024",
    estValue: "6,200,000",
  },
  {
    id: 2,
    jobRequest: "Update press kit for company redesign",
    submitted: "28-10-2024",
    status: "Need to start",
    submitter: "Irfan Khan",
    url: "www.irfankhatp...",
    assigned: "Tejas Pandey",
    priority: "High",
    dueDate: "30-10-2024",
    estValue: "3,500,000",
  },
  {
    id: 3,
    jobRequest: "Finalize user testing feedback for app...",
    submitted: "05-12-2024",
    status: "In-progress",
    submitter: "Mark Johnson",
    url: "www.markjohns...",
    assigned: "Rachel Lee",
    priority: "Medium",
    dueDate: "10-12-2024",
    estValue: "4,750,000",
  },
  {
    id: 4,
    jobRequest: "Design new features for the website",
    submitted: "10-01-2025",
    status: "Complete",
    submitter: "Emily Green",
    url: "www.emilygreen...",
    assigned: "Tom Wright",
    priority: "Low",
    dueDate: "15-01-2025",
    estValue: "5,300,000",
  },
  {
    id: 5,
    jobRequest: "Prepare financial report for Q4",
    submitted: "25-01-2025",
    status: "Blocked",
    submitter: "Jessica Brown",
    url: "www.jessicabro...",
    assigned: "Kevin Smith",
    priority: "Low",
    dueDate: "30-01-2025",
    estValue: "2,800,000",
  },
]

// Create empty rows for spreadsheet
const createEmptyRows = (startIndex: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: startIndex + i + 1,
    jobRequest: "",
    submitted: "",
    status: "Need to start" as const,
    submitter: "",
    url: "",
    assigned: "",
    priority: "Medium" as const,
    dueDate: "",
    estValue: "",
  }))
}

const columnHelper = createColumnHelper<TaskData>()

const StatusBadge = ({ status }: { status: TaskData["status"] }) => {
  const getStatusStyles = (status: TaskData["status"]) => {
    switch (status) {
      case "In-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Need to start":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Complete":
        return "bg-green-100 text-green-800 border-green-200"
      case "Blocked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  )
}

const PriorityBadge = ({ priority }: { priority: TaskData["priority"] }) => {
  const getPriorityStyles = (priority: TaskData["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getPriorityStyles(priority)}`}
    >
      {priority}
    </span>
  )
}

interface EditableCellProps {
  value: string
  rowIndex: number
  columnId: string
  onChange: (rowIndex: number, columnId: string, value: string) => void
  isSelected: boolean
  isEditing: boolean
  onCellClick: (rowIndex: number, columnId: string) => void
  onStartEdit: (rowIndex: number, columnId: string) => void
  onStopEdit: () => void
}

const EditableCell = ({
  value,
  rowIndex,
  columnId,
  onChange,
  isSelected,
  isEditing,
  onCellClick,
  onStartEdit,
  onStopEdit,
}: EditableCellProps) => {
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter") {
      onChange(rowIndex, columnId, editValue)
      onStopEdit()
    }
    if (e.key === "Escape") {
      setEditValue(value)
      onStopEdit()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      onChange(rowIndex, columnId, editValue)
      onStopEdit()
      // Move to next cell
      onCellClick(rowIndex, columnId)
    }
  }

  const handleBlur = () => {
    onChange(rowIndex, columnId, editValue)
    onStopEdit()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCellClick(rowIndex, columnId)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartEdit(rowIndex, columnId)
  }

  return (
    <div
      className={`relative h-full w-full min-h-[32px] cursor-cell border-r border-b border-gray-200 ${
        isSelected ? "bg-blue-50 ring-2 ring-blue-500 ring-inset z-10" : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full px-2 py-1 text-sm border-none outline-none bg-white resize-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <div className="px-2 py-1 text-sm truncate h-full flex items-center">{value || ""}</div>
      )}
    </div>
  )
}

export function SpreadsheetView() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [activeTab, setActiveTab] = useState("All Orders")
  const [activeView, setActiveView] = useState("Q3 Financial Overview")
  const [data, setData] = useState(() => [...mockData, ...createEmptyRows(mockData.length, 20)])
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null)
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)

  const updateData = useCallback((rowIndex: number, columnId: string, value: string) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          }
        }
        return row
      }),
    )
  }, [])

  const handleCellClick = useCallback((rowIndex: number, columnId: string) => {
    setSelectedCell({ rowIndex, columnId })
    setEditingCell(null)
  }, [])

  const handleStartEdit = useCallback((rowIndex: number, columnId: string) => {
    setSelectedCell({ rowIndex, columnId })
    setEditingCell({ rowIndex, columnId })
  }, [])

  const handleStopEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || editingCell) return

      const { rowIndex, columnId } = selectedCell
      const columnIds = [
        "jobRequest",
        "submitted",
        "status",
        "submitter",
        "url",
        "assigned",
        "priority",
        "dueDate",
        "estValue",
      ]
      const currentColumnIndex = columnIds.indexOf(columnId)

      let newRowIndex = rowIndex
      let newColumnIndex = currentColumnIndex

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          newRowIndex = Math.max(0, rowIndex - 1)
          break
        case "ArrowDown":
          e.preventDefault()
          newRowIndex = Math.min(data.length - 1, rowIndex + 1)
          break
        case "ArrowLeft":
          e.preventDefault()
          newColumnIndex = Math.max(0, currentColumnIndex - 1)
          break
        case "ArrowRight":
        case "Tab":
          e.preventDefault()
          newColumnIndex = Math.min(columnIds.length - 1, currentColumnIndex + 1)
          break
        case "Enter":
          e.preventDefault()
          handleStartEdit(rowIndex, columnId)
          break
        case "Delete":
        case "Backspace":
          e.preventDefault()
          updateData(rowIndex, columnId, "")
          break
        default:
          // Start editing if user types a character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            handleStartEdit(rowIndex, columnId)
          }
          break
      }

      if (newRowIndex !== rowIndex || newColumnIndex !== currentColumnIndex) {
        setSelectedCell({ rowIndex: newRowIndex, columnId: columnIds[newColumnIndex] })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedCell, editingCell, data.length, handleStartEdit, updateData])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "rowNumber",
        header: "",
        cell: ({ row }) => (
          <div
            className="w-12 text-center text-sm text-gray-500 font-mono bg-gray-100 py-2 border-r border-gray-300 cursor-pointer hover:bg-gray-200"
            onClick={() => console.log(`Row ${row.index + 1} selected`)}
          >
            {row.index + 1}
          </div>
        ),
        size: 48,
      }),
      columnHelper.accessor("jobRequest", {
        header: "Job Request",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.jobRequest}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 280,
      }),
      columnHelper.accessor("submitted", {
        header: "Submitted",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.submitted}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 120,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row, column }) => (
          <div
            className={`h-full w-full min-h-[32px] cursor-cell flex items-center px-2 border-r border-b border-gray-200 ${
              selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id
                ? "bg-blue-50 ring-2 ring-blue-500 ring-inset z-10"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleCellClick(row.index, column.id)}
          >
            <StatusBadge status={row.original.status} />
          </div>
        ),
        size: 140,
      }),
      columnHelper.accessor("submitter", {
        header: "Submitter",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.submitter}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 140,
      }),
      columnHelper.accessor("url", {
        header: "URL",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.url}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 160,
      }),
      columnHelper.accessor("assigned", {
        header: "Assigned",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.assigned}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 140,
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: ({ row, column }) => (
          <div
            className={`h-full w-full min-h-[32px] cursor-cell flex items-center px-2 border-r border-b border-gray-200 ${
              selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id
                ? "bg-blue-50 ring-2 ring-blue-500 ring-inset z-10"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleCellClick(row.index, column.id)}
          >
            <PriorityBadge priority={row.original.priority} />
          </div>
        ),
        size: 100,
      }),
      columnHelper.accessor("dueDate", {
        header: "Due Date",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.dueDate}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 120,
      }),
      columnHelper.accessor("estValue", {
        header: "Est. Value",
        cell: ({ row, column }) => (
          <EditableCell
            value={row.original.estValue}
            rowIndex={row.index}
            columnId={column.id}
            onChange={updateData}
            isSelected={selectedCell?.rowIndex === row.index && selectedCell?.columnId === column.id}
            isEditing={editingCell?.rowIndex === row.index && editingCell?.columnId === column.id}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={handleStopEdit}
          />
        ),
        size: 120,
      }),
    ],
    [selectedCell, editingCell, updateData, handleCellClick, handleStartEdit, handleStopEdit],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleToolbarAction = (action: string) => {
    console.log(`${action} clicked`)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log(`Tab changed to: ${tab}`)
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    console.log(`View changed to: ${view}`)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <span className="text-gray-400">📁</span>
          <span>Workspace</span>
          <ChevronDown className="w-3 h-3" />
          <span>Folder 2</span>
          <ChevronDown className="w-3 h-3" />
          <span className="font-medium text-gray-900">Spreadsheet 3</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search within sheet" className="pl-8 w-60 h-8 text-sm border-gray-300" />
          </div>
          <Button variant="ghost" size="sm" className="relative p-1">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              J
            </div>
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-gray-500">john.doe...</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Hide fields")} className="text-xs">
            <EyeOff className="w-4 h-4 mr-1" />
            Hide fields
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Sort")} className="text-xs">
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Sort
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Filter")} className="text-xs">
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Cell view")} className="text-xs">
            <Grid3X3 className="w-4 h-4 mr-1" />
            Cell view
          </Button>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Import")} className="text-xs">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Export")} className="text-xs">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToolbarAction("Share")} className="text-xs">
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button
            size="sm"
            onClick={() => handleToolbarAction("New Action")}
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Action
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1">
          <Button
            variant={activeView === "Q3 Financial Overview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleViewChange("Q3 Financial Overview")}
            className="text-xs flex items-center space-x-1"
          >
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Q3 Financial Overview</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange("ABC")}
            className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
          >
            ABC
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange("Answer a question")}
            className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200"
          >
            Answer a question
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange("Extract")}
            className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200"
          >
            Extract
          </Button>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto bg-gray-50" tabIndex={0}>
        <div className="min-w-full">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-gray-100 sticky top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300 last:border-r-0 bg-gray-100"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center space-x-1 hover:text-gray-900"
                              : "flex items-center"
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3" />}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-0 border-gray-200" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Tabs */}
      <div className="flex items-center px-4 py-2 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-1">
          {["All Orders", "Pending", "Reviewed", "Arrived"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleTabChange(tab)}
              className="text-xs"
            >
              {tab}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
