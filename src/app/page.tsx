/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  FolderPlus, 
  Upload, 
  CheckCircle, 
  Search, 
  Clock, 
  Shield, 
  Database, 
  Bell, 
  Menu, 
  X, 
  ChevronDown,
  UserCheck,
  BookOpen,
  FileCheck,
  Printer,
  Award,
  Stethoscope
} from "lucide-react";
import Footer from "@/components/common/Footer";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Process steps for eLog Book management
  const processSteps = [
    {
      title: "Profile Creation",
      description: "Register your medical student profile with your details including enrollment number, department, rotations, and personal information",
      icon: <UserCheck size={40} className="text-blue-600" />,
      action: "Create"
    },
    {
      title: "Teacher Assignment",
      description: "Assign a supervising teacher who will review and approve your profile before you can create your eLog Book",
      icon: <Stethoscope size={40} className="text-emerald-600" />,
      action: "Assign"
    },
    {
      title: "eLog Book Creation",
      description: "Document your clinical experiences, procedures, reflections, and learning outcomes in a structured digital format",
      icon: <BookOpen size={40} className="text-indigo-600" />,
      action: "Document"
    },
    {
      title: "Verification System",
      description: "Multi-step verification by medical faculty to ensure accuracy and completeness of your clinical documentation",
      icon: <CheckCircle size={40} className="text-amber-600" />,
      action: "Verify"
    },
    {
      title: "Progress Tracking",
      description: "Monitor your progress in required clinical competencies and procedures throughout your medical education",
      icon: <Award size={40} className="text-violet-600" />,
      action: "Track"
    },
    {
      title: "Export & Print",
      description: "Export your approved eLog Book as an Excel file or print it for your physical records or submission",
      icon: <Printer size={40} className="text-rose-600" />,
      action: "Export"
    }
  ];

  // Key features with improved descriptions for medical students
  const keyFeatures = [
    {
      title: "Clinical Experience Tracking",
      description: "Document all patient encounters, procedures, and clinical skills development",
      icon: <Stethoscope className="text-blue-600 flex-shrink-0" size={20} />
    },
    {
      title: "Faculty Supervision",
      description: "Seamless workflow for assigning and receiving feedback from medical faculty",
      icon: <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
    },
    {
      title: "Deadline Notifications",
      description: "Automated alerts for submission deadlines and faculty feedback",
      icon: <Bell className="text-amber-600 flex-shrink-0" size={20} />
    },
    {
      title: "Learning Portfolio",
      description: "Build a comprehensive portfolio of your clinical experiences and reflections",
      icon: <BookOpen className="text-indigo-600 flex-shrink-0" size={20} />
    },
    {
      title: "Revision History",
      description: "Complete history of all entries with the ability to review faculty feedback",
      icon: <Database className="text-violet-600 flex-shrink-0" size={20} />
    },
    {
      title: "Educational Progress",
      description: "Track your advancement in required competencies throughout your medical education",
      icon: <Clock className="text-rose-600 flex-shrink-0" size={20} />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Navbar */}
      <nav className="border-b border-gray-200 bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Stethoscope size={20} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Med<span className="text-blue-600">eLog</span></span>
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium">
                  Register
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white pb-3 px-4">
            <div className="pt-4 pb-2 border-t border-gray-200 flex flex-col space-y-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="inline-block mb-2">
              <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">Medical Students</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 leading-tight">
              Digital Clinical <br className="hidden sm:inline" />eLog Book
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Document, track, and verify your clinical experiences with our <br className="hidden sm:inline" /> secure and efficient eLog Book system for medical students.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Create Your eLog Book
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-lg w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Process Flow Section */}
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-sm">
            <div className="text-center mb-12">
              <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">How It Works</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">Simple Workflow for Medical Students</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform streamlines the documentation and verification of your clinical experiences
              </p>
            </div>

            {/* Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {processSteps.map((step, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-all border-gray-200 group">
                  <CardHeader className="pb-2 bg-gradient-to-b from-gray-50 to-white">
                    <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform">{step.icon}</div>
                    <CardTitle className="text-xl text-center">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-center text-base min-h-16">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-6">
                    {/* <Button variant="secondary" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {step.action}
                    </Button> */}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white shadow-sm rounded-2xl p-12 border border-gray-100">
            <div className="text-center mb-12">
              <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">Key Benefits</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">Enhanced Learning Experience</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful tools to document and reflect on your medical education journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyFeatures.map((feature, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Section */}
          {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to digitize your clinical documentation?</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Join fellow medical students who have streamlined their clinical logging, 
              received timely feedback, and improved their learning experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div> */}
        </div>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}