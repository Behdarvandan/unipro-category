"use client";

import Link from "next/link";

interface Category {
  id: number;
  name: string;
  color: string;
  prefix: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.id}`}
          className="block group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex flex-col h-full justify-between gap-4">
            <div>
              {/* Kategori Renk Şeması */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-blue-600`}
              >
                {category.prefix || "UNI"}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-4 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              Ürünleri İncele →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
