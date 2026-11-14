import { useEffect } from "react"

/** Sets document.title while the calling page is mounted, then restores the previous title. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
