'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  
  const generateBreadcrumbs = () => {
    
    const pathSegments = pathname.split('/').filter(segment => segment);
    
   
    return pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      
      const label = segment.charAt(0).toUpperCase() + 
                    segment.slice(1).replace(/-/g, ' ');
      
   
      const isLast = index === pathSegments.length - 1;
      
      return (
        <React.Fragment key={path}>
          <BreadcrumbItem className="hidden md:block">
            {isLast ? (
              <BreadcrumbPage>{label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={path}>{label}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isLast && (
            <BreadcrumbSeparator className="hidden md:block" />
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <SidebarProvider className='dark'>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-b-gray-200">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {generateBreadcrumbs()}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
