import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { useWishlist } from '@/hooks/use-wishlist';

export default function WishlistPage() {
  const { items: wishlistItems, loading, error, remove, toggle } = useWishlist();

  const fallbackWishlist = [
    {
      id: 'sample1',
      name: 'Sample Handicraft Item',
      artist: 'Demo Artist',
      price: 1000,
      originalPrice: 1200,
      image:
        'https://static.wixstatic.com/media/d7d9fb_c4f7592c8deb4549bf6418c8b27ca31d~mv2.png?originWidth=256&originHeight=192',
      inStock: true,
    },
  ];

  const list = wishlistItems.length > 0 ? wishlistItems : fallbackWishlist;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-bold text-primary">
            My Wishlist ({wishlistItems.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-primary/60">Loading wishlist…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && wishlistItems.length === 0 && !error && (
            <p className="text-sm text-primary/60 mb-4">Your wishlist is empty. Here is a sample item.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((item: any, index: number) => (
              <motion.div key={item.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      width={400}
                      height={300}
                      loading="lazy"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-primary">{item.name}</h3>
                          <p className="text-sm text-primary/60">by {item.artist}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-heading text-xl font-bold text-primary">₹{item.price}</div>
                          {item.originalPrice && (
                            <div className="text-xs line-through text-primary/50">₹{item.originalPrice}</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (item.id ? remove(item.id) : null)}
                        >
                          Remove
                        </Button>
                        <Button
                          className="bg-neonaccent text-primary hover:bg-neonaccent/90"
                          size="sm"
                          onClick={() =>
                            toggle({ id: item.id, name: item.name, artist: item.artist, image: item.image, price: item.price })
                          }
                        >
                          Move to Cart (toggle)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}