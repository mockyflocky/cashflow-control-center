
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Category,
  Transaction,
  addTransaction,
  getCategories,
} from "@/utils/financeUtils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  onSuccess: () => void;
  defaultType?: "income" | "expense";
}

type FormValues = {
  amount: string;
  description: string;
  categoryId?: string;
  type: "income" | "expense";
  date: string;
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  defaultType = "expense",
}) => {
  const [categories] = useState<Category[]>(getCategories());

  const form = useForm<FormValues>({
    defaultValues: {
      amount: "",
      description: "",
      type: defaultType,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      const amount = parseInt(data.amount.replace(/[^\d]/g, ""));
      
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const transaction: Omit<Transaction, "id"> = {
        amount,
        description: data.description,
        type: data.type,
        date: data.date,
        ...(data.categoryId && data.type === "expense" ? { categoryId: data.categoryId } : {}),
      };

      addTransaction(transaction);
      form.reset({
        amount: "",
        description: "",
        type: defaultType,
        categoryId: undefined,
        date: new Date().toISOString().split("T")[0],
      });
      toast.success("Transaction added successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const selectedType = form.watch("type");

  // Format input as currency
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    if (value === "") {
      form.setValue("amount", "");
      return;
    }
    
    const formattedValue = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(value));
    
    form.setValue("amount", formattedValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={selectedType === "income" ? "default" : "outline"}
            className={cn(
              "flex-1 gap-2",
              selectedType === "income" && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => form.setValue("type", "income")}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Income
          </Button>
          <Button
            type="button"
            variant={selectedType === "expense" ? "default" : "outline"}
            className={cn(
              "flex-1 gap-2",
              selectedType === "expense" && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => form.setValue("type", "expense")}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Expense
          </Button>
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="Rp 0"
                  className="text-lg"
                  {...field}
                  onChange={handleAmountChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What's this for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedType === "expense" && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
