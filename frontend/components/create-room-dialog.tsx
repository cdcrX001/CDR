'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function CreateRoomDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [keyPairGenerated, setKeyPairGenerated] = useState(false)

  const handleGenerateKeyPair = () => {
    setKeyPairGenerated(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Data Clean Room</DialogTitle>
          <DialogDescription>
            Create and manage your data clean rooms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!keyPairGenerated ? (
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={handleGenerateKeyPair}
            >
              Generate Key Pair
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <p className="font-medium">Generated Keys:</p>
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs font-medium">Public Key:</p>
                    <p className="text-xs break-all">LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUJkQ...</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs font-medium">Private Key:</p>
                    <p className="text-xs break-all">LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1...</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="default">
                Create Data Clean Room
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

