
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CategoryList from "@/components/CategoryList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Transaction, getTransactions, deleteTransaction, formatCurrency, formatDate, getCategoryById } from "@/utils/financeUtils";
import { Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const Admin = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("transactions");
  
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const allTransactions = getTransactions();
    setTransactions(allTransactions);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
      loadTransactions();
      toast.success("Transaction deleted successfully");
    }
  };

  const handleCategoryChange = () => {
    // Reload transactions to refresh category data
    loadTransactions();
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage transactions and categories
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
            <CardDescription>
              Manage transactions and categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => {
                          const category = transaction.categoryId 
                            ? getCategoryById(transaction.categoryId)
                            : undefined;
                            
                          return (
                            <TableRow key={transaction.id}>
                              <TableCell>{formatDate(transaction.date)}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {transaction.type === "income" ? (
                                    <>
                                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                      <span>Income</span>
                                    </>
                                  ) : (
                                    <>
                                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                      <span>Expense</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {category ? (
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                  </div>
                                ) : (
                                  transaction.type === "income" ? "-" : "Uncategorized"
                                )}
                              </TableCell>
                              <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="categories">
                <CategoryList onCategoryChange={handleCategoryChange} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
