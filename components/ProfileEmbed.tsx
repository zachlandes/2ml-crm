import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Connection } from '@/lib/types';
import Link from 'next/link';

interface ProfileEmbedProps {
  connection: Connection | null;
}

export default function ProfileEmbed({ connection }: ProfileEmbedProps) {
  if (!connection) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 h-[calc(100vh-200px)] flex items-center justify-center text-muted-foreground">
        <p>Select a connection to view their profile</p>
      </div>
    );
  }

  // Format LinkedIn profile URL
  const linkedInUrl = connection.url;

  return (
    <Card className="h-[calc(100vh-200px)] overflow-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{connection.firstName} {connection.lastName}</CardTitle>
        <CardDescription className="text-lg">
          {connection.position} at {connection.company}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/20 rounded-lg">
          <h3 className="font-semibold mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 gap-2">
            {connection.email && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm">{connection.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Connected On</p>
              <p className="text-sm">{connection.connectedOn}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-lg">
          <h3 className="font-semibold mb-2">Professional Info</h3>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-sm font-medium">Company</p>
              <p className="text-sm">{connection.company}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Position</p>
              <p className="text-sm">{connection.position}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent/20 rounded-lg border-2 border-accent/20">
          <h3 className="font-semibold mb-2">Arc Browser Tips</h3>
          <ol className="text-sm space-y-2 list-decimal pl-4">
            <li>Click the button below to open LinkedIn in a new tab</li>
            <li>In Arc, drag the new tab to the side to create a split view</li>
            <li>Now you can view the profile while using the CRM</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" asChild>
          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
            Open LinkedIn Profile
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
} 