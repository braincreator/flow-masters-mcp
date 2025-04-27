'use client'

import React from 'react'
import { 
  useForm,
  useFormValues,
  useFormErrors,
  useFormSubmission,
  useFormField
} from '@/hooks/useContexts'
import { z } from 'zod'
import { FormProvider } from '@/providers/FormProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Home, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

// Define form validation schema
const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type UserFormValues = z.infer<typeof userSchema>

// Form field component
function FormField({ 
  label, 
  name, 
  type = 'text', 
  placeholder,
  validation,
  icon: Icon,
}: { 
  label: string
  name: string
  type?: string
  placeholder?: string
  validation?: any[]
  icon?: React.ComponentType<any>
}) {
  const { 
    field, 
    error, 
    touched 
  } = useFormField(name, validation)
  
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...field}
        className={error && touched ? 'border-red-500' : ''}
      />
      {error && touched && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// Checkbox field component
function CheckboxField({ 
  label, 
  name, 
  validation,
}: { 
  label: string
  name: string
  validation?: any[]
}) {
  const { 
    field, 
    error, 
    touched,
    setValue 
  } = useFormField(name, validation)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={name} 
          checked={field.value as boolean} 
          onCheckedChange={(checked) => setValue(checked)}
        />
        <Label htmlFor={name}>{label}</Label>
      </div>
      {error && touched && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// Form summary component
function FormSummary() {
  const { values } = useFormValues<UserFormValues>()
  const { errors, isValid } = useFormErrors()
  const { submitCount } = useFormSubmission()
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Form Values</h3>
          <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-[200px]">
            {JSON.stringify(values, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Form Errors</h3>
          <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-[200px]">
            {Object.keys(errors).length > 0 
              ? JSON.stringify(errors, null, 2) 
              : 'No errors'}
          </pre>
        </div>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Form is {isValid ? 'valid' : 'invalid'}</span>
        <span>Submit count: {submitCount}</span>
      </div>
    </div>
  )
}

// Registration form component
function RegistrationForm() {
  const { handleSubmit, formState } = useForm<UserFormValues>()
  const { isSubmitting } = formState
  
  const onSubmit = async (values: UserFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success message
    toast.success('Registration successful!', {
      description: `Welcome, ${values.firstName} ${values.lastName}!`,
    })
    
    console.log('Form submitted:', values)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="firstName"
          placeholder="John"
          icon={User}
          validation={[
            { type: 'required', message: 'First name is required' },
            { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' },
          ]}
        />
        <FormField
          label="Last Name"
          name="lastName"
          placeholder="Doe"
          icon={User}
          validation={[
            { type: 'required', message: 'Last name is required' },
            { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' },
          ]}
        />
      </div>
      
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="john.doe@example.com"
        icon={Mail}
        validation={[
          { type: 'required', message: 'Email is required' },
          { type: 'email', message: 'Invalid email address' },
        ]}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="********"
          icon={Lock}
          validation={[
            { type: 'required', message: 'Password is required' },
            { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
          ]}
        />
        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="********"
          icon={Lock}
          validation={[
            { type: 'required', message: 'Please confirm your password' },
            { 
              type: 'custom', 
              validate: (value: string) => {
                const { values } = useFormValues<UserFormValues>()
                return value === values.password
              },
              message: 'Passwords do not match',
            },
          ]}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Phone (optional)"
          name="phone"
          placeholder="+1 (555) 123-4567"
          icon={Phone}
        />
        <FormField
          label="Address (optional)"
          name="address"
          placeholder="123 Main St, City"
          icon={Home}
        />
      </div>
      
      <CheckboxField
        label="I agree to the terms and conditions"
        name="agreeToTerms"
        validation={[
          { 
            type: 'custom', 
            validate: (value: boolean) => value === true,
            message: 'You must agree to the terms and conditions',
          },
        ]}
      />
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Register
          </>
        )}
      </Button>
    </form>
  )
}

// Main example component
export function FormExample() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Form Provider Example</CardTitle>
        <CardDescription>
          This component demonstrates how to use the FormProvider with validation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="form">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="form">Registration Form</TabsTrigger>
            <TabsTrigger value="debug">Form Debug</TabsTrigger>
          </TabsList>
          
          <FormProvider
            defaultValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: '',
              address: '',
              agreeToTerms: false,
            }}
          >
            <TabsContent value="form">
              <RegistrationForm />
            </TabsContent>
            
            <TabsContent value="debug">
              <FormSummary />
            </TabsContent>
          </FormProvider>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          Using selector hooks for better performance: useFormValues, useFormErrors, useFormSubmission, useFormField
        </p>
      </CardFooter>
    </Card>
  )
}
